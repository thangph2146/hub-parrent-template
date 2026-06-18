/**
 * Materialize app API từ deploy/nest sang app deploy.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { PRODUCT_LINES, MAIN_API_PATH } = require('../../../config/product-lines.cjs')
const {
  resolveTemplateRoot,
  listTemplateModuleIds,
  TEMPLATE_BANNER,
  SKIP_DIRS,
} = require('../../../config/template.config.cjs')
const { resolveApiModules } = require('../../../config/render.config.cjs')
const { resolveModuleClosure } = require('./resolve-module-closure.cjs')
const { patchRenderAppModule, RENDER_BOOTSTRAP_MODULES } = require('./patch-render-app-module.cjs')
const { patchDatabaseSeeder } = require('./patch-database-seeder.cjs')
const { pruneThinModuleRedundantFiles } = require('../prune/prune-thin-module-runtime.cjs')
const { pruneCommonRuntime } = require('../prune/prune-common-runtime.cjs')
const { pruneModuleBasesRuntime } = require('../prune/prune-module-bases-runtime.cjs')
const { pruneEntitiesRuntime, logEntityFootprint } = require('../prune/prune-entities-runtime.cjs')

const ROOT_FILES = [
  'nest-cli.json',
  'tsconfig.json',
  'tsconfig.build.json',
  'tsconfig.test.json',
  'eslint.config.mjs',
  'mikro-orm.config.ts',
  '.env.example',
  '.gitignore',
  '.prettierrc',
]

const ROOT_DIRS = ['test', 'scripts']
const SHELL_DIRS = [
  'src/common',
  'src/common/crud',
  'src/common/module-bases',
  'src/common/module-types',
  'src/config',
  'src/data-test',
  'src/entities',
  'src/mikro-orm',
]

const BINARY_EXTENSIONS = new Set(['.gz', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff', '.woff2'])
const SHELL_FILES = ['src/main.ts', 'src/app.module.ts']
const SRC_EXTRA_DIRS = ['migrations', 'seeders', 'seeds']
const SRC_EXTRA_FILES = [
  'seed-superadmin.ts',
  'seed-demo.ts',
  'seed-guides.ts',
  'seed-checkin-demo.ts',
]

/** Seed cần module cụ thể — partial render bỏ qua nếu thiếu dependency. */
const SEED_FILE_MODULE_DEPS = {
  'seed-full-export.ts': ['system'],
  'seeds/orders-sample.runner.ts': ['orders', 'products'],
  'seeds/products-sample.runner.ts': ['products'],
  'seeds/promo-codes-sample.runner.ts': ['promo-codes'],
  'seeds/storesync-sample.data.ts': ['products', 'orders'],
}

const ALLOWED_SRC_TOP = new Set([
  ...SHELL_DIRS.map((d) => d.replace(/^src\//, '')),
  ...SRC_EXTRA_DIRS,
  'seeds',
  ...SKIP_DIRS,
])

function packageNameForApp(appRel) {
  for (const apps of Object.values(PRODUCT_LINES)) {
    if (apps.api?.path === appRel) return apps.api.package
  }
  const slug = appRel.split('/').slice(1).join('-') || 'api'
  return `@${slug}`
}

const { writeFileWithRetry } = require('../fs-write-retry.cjs')

function withBanner(relPath, content) {
  if (!relPath.endsWith('.ts')) return content
  if (content.startsWith('/** AUTO-GENERATED')) return content
  return TEMPLATE_BANNER + content
}

function isBinaryFile(relPath) {
  const ext = path.extname(relPath).toLowerCase()
  return BINARY_EXTENSIONS.has(ext)
}

function copyFile(src, dest, relPath) {
  if (isBinaryFile(relPath)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    return
  }
  writeFileWithRetry(dest, withBanner(relPath, fs.readFileSync(src, 'utf8')))
}

function copyTree(srcDir, destDir, relPrefix = '') {
  if (!fs.existsSync(srcDir)) return
  fs.mkdirSync(destDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    const rel = path.join(relPrefix, entry.name).replace(/\\/g, '/')
    if (entry.isDirectory()) copyTree(srcPath, destPath, rel)
    else copyFile(srcPath, destPath, rel)
  }
}

function writePackageJson(appRoot, appRel) {
  const templatePkgPath = path.join(resolveTemplateRoot(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(templatePkgPath, 'utf8'))
  pkg.name = packageNameForApp(appRel)
  writeFileWithRetry(path.join(appRoot, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`)
}

function pruneExtraModules(appRoot, keepModules) {
  const srcDir = path.join(appRoot, 'src')
  const pruned = []
  if (!fs.existsSync(srcDir)) return pruned
  const keep = new Set([...keepModules, ...ALLOWED_SRC_TOP])
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || keep.has(entry.name)) continue
    fs.rmSync(path.join(srcDir, entry.name), { recursive: true, force: true })
    pruned.push(entry.name)
    console.log(`[render:template] pruned src/${entry.name}/`)
  }
  return pruned
}

function shouldCopySeedFile(rel, moduleIds, isPartialRender) {
  if (!isPartialRender) return true
  const deps = SEED_FILE_MODULE_DEPS[rel]
  if (!deps?.length) return true
  return deps.every((id) => moduleIds.includes(id))
}

function renderApiFromTemplate(appRel, opts = {}) {
  const templateRoot = resolveTemplateRoot()
  if (!fs.existsSync(path.join(templateRoot, 'src', 'main.ts'))) {
    throw new Error('[render:template] Thiếu template — chạy pnpm api:sync-template')
  }

  const appRoot = path.join(ROOT, appRel)
  fs.mkdirSync(appRoot, { recursive: true })

  let moduleIds = opts.modules?.length ? [...opts.modules] : resolveApiModules(appRel).modules
  const appConfig = resolveApiModules(appRel).config ?? {}
  const excludedModules = new Set(appConfig.excludeModules ?? [])
  const requestedCount = moduleIds.length
  const explicitModules = Boolean(opts.modules?.length)
  const isPartialRenderEarly = explicitModules && !opts.allModules

  if (isPartialRenderEarly) {
    const bootstrapModules = RENDER_BOOTSTRAP_MODULES.filter((id) => !excludedModules.has(id))
    moduleIds = [...new Set([...bootstrapModules, ...moduleIds])]
  }

  if (opts.allModules) moduleIds = listTemplateModuleIds(templateRoot)
  moduleIds = [...new Set(moduleIds)].sort((a, b) => a.localeCompare(b))

  const allTemplateIds = listTemplateModuleIds(templateRoot)

  let closureAdded = 0
  if (!opts.allModules) {
    const expanded = resolveModuleClosure(moduleIds, templateRoot)
    if (expanded.length > moduleIds.length) {
      closureAdded = expanded.length - moduleIds.length
      console.log(`[render:template] +${closureAdded} module (closure)`)
    }
    moduleIds = expanded.filter((id) => !excludedModules.has(id))
  }

  const isPartialRender =
    !opts.allModules &&
    (Boolean(explicitModules) || moduleIds.length < allTemplateIds.length)

  if (!moduleIds.length) throw new Error(`[render:template] ${appRel}: danh sách module rỗng`)

  console.log(`[render:template] ${appRel} — ${moduleIds.length} module`)

  if (opts.scaffold || !fs.existsSync(path.join(appRoot, 'package.json'))) {
    writePackageJson(appRoot, appRel)
  }

  for (const rel of ROOT_FILES) {
    const src = path.join(templateRoot, rel)
    if (fs.existsSync(src)) copyFile(src, path.join(appRoot, rel), rel)
  }
  for (const rel of ROOT_DIRS) {
    copyTree(path.join(templateRoot, rel), path.join(appRoot, rel), rel)
  }
  if (appRel.replace(/\\/g, '/') !== MAIN_API_PATH.replace(/\\/g, '/')) {
    const archiveDir = path.join(appRoot, 'scripts', 'archive')
    if (fs.existsSync(archiveDir)) {
      fs.rmSync(archiveDir, { recursive: true, force: true })
    }
  }
  for (const rel of SHELL_DIRS) {
    const src = path.join(templateRoot, rel)
    const dest = path.join(appRoot, rel)
    fs.rmSync(dest, { recursive: true, force: true })
    copyTree(src, dest, rel)
  }
  for (const rel of SHELL_FILES) {
    const src = path.join(templateRoot, rel)
    if (fs.existsSync(src)) copyFile(src, path.join(appRoot, rel), rel)
  }

  if (isPartialRender) {
    patchRenderAppModule(appRoot, moduleIds, {
      quiet: false,
      excludeModules: [...excludedModules],
    })
  }

  for (const dir of SRC_EXTRA_DIRS) {
    copyTree(path.join(templateRoot, 'src', dir), path.join(appRoot, 'src', dir), `src/${dir}`)
  }
  for (const file of SRC_EXTRA_FILES) {
    const src = path.join(templateRoot, 'src', file)
    if (fs.existsSync(src)) copyFile(src, path.join(appRoot, 'src', file), `src/${file}`)
  }
  for (const [rel] of Object.entries(SEED_FILE_MODULE_DEPS)) {
    if (!shouldCopySeedFile(rel, moduleIds, isPartialRender)) {
      const dest = path.join(appRoot, 'src', rel)
      if (fs.existsSync(dest)) fs.unlinkSync(dest)
      continue
    }
    const src = path.join(templateRoot, 'src', rel)
    if (fs.existsSync(src)) copyFile(src, path.join(appRoot, 'src', rel), `src/${rel}`)
  }

  const skippedModules = []
  for (const moduleId of moduleIds) {
    const src = path.join(templateRoot, 'src', moduleId)
    if (!fs.existsSync(src)) {
      console.warn(`[render:template] bỏ qua: ${moduleId}`)
      skippedModules.push(moduleId)
      continue
    }
    copyTree(src, path.join(appRoot, 'src', moduleId), `src/${moduleId}`)
  }

  pruneModuleBasesRuntime(appRoot, moduleIds, { quiet: !opts.prune })
  pruneThinModuleRedundantFiles(appRoot, { quiet: false })
  pruneCommonRuntime(appRoot, { quiet: true, moduleIds })
  if (isPartialRender) {
    patchDatabaseSeeder(appRoot, moduleIds, { quiet: false })
  }
  const prunedTopLevel = opts.prune ? pruneExtraModules(appRoot, moduleIds) : []

  let entityGraph = null
  if (opts.pruneEntities) {
    entityGraph = pruneEntitiesRuntime(appRoot, moduleIds, { quiet: false })
  } else if (isPartialRender) {
    entityGraph = logEntityFootprint(moduleIds)
  }

  console.log(`[render:template] xong → ${appRel}`)

  const normalizedRel = appRel.replace(/\\/g, '/')
  if (normalizedRel !== MAIN_API_PATH) {
    const { writeApiEnvExampleForAppPath } = require(path.join(
      ROOT,
      'script-system/env/api-env-profiles.cjs',
    ))
    if (writeApiEnvExampleForAppPath(normalizedRel)) {
      console.log(`[render:template] .env.example ← env profile (${normalizedRel})`)
    }
  }

  return {
    moduleIds,
    requestedCount,
    closureAdded,
    prunedTopLevel,
    skippedModules,
    allModules: Boolean(opts.allModules),
    partialRender: isPartialRender,
    entityGraph,
  }
}

module.exports = { renderApiFromTemplate }
