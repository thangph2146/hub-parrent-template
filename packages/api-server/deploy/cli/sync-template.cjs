/**
 * Sync apps/main/api → packages/api-server/deploy/nest
 *
 *   pnpm api:sync-template
 *   pnpm api:sync-template -- --verbose   # log từng file copy/prune
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('./lib/monorepo-root.cjs')
const { createLogger, parseQuietFlag, parseVerboseFlag } = require('./lib/cli-logger.cjs')
const { printSyncTemplateSummary } = require('./lib/sync/sync-template-summary.cjs')
const {
  MAIN_API_PATH,
  SKIP_DIRS,
  SYNC_SKIP_SRC_DIRS,
  SYNC_SKIP_NAMES,
  SYNC_SKIP_ROOT_FILES,
  SYNC_SKIP_FILE_PATTERNS,
  listTemplateModuleIds,
  resolveTemplateRoot,
} = require('../config/template.config.cjs')
const { syncCrudRuntime } = require('./lib/sync/sync-crud-runtime.cjs')
const { syncCommonRoot } = require('./lib/sync/sync-common-runtime.cjs')
const { syncModuleBases, syncModuleTypes } = require('./lib/sync/sync-module-bases.cjs')
const { materializeInheritanceBindings } = require('./lib/sync/materialize-inheritance-bindings.cjs')
const { materializePackageModuleBindings } = require('./lib/sync/materialize-package-module-bindings.cjs')
const { pruneThinModuleRedundantFiles } = require('./lib/prune/prune-thin-module-runtime.cjs')
const { pruneCommonRuntime } = require('./lib/prune/prune-common-runtime.cjs')
const { syncContractSpecs } = require('./lib/sync/sync-contract-specs.cjs')
const { syncModuleServiceSpecs } = require('./lib/sync/sync-module-service-specs.cjs')
const { patchTemplateAppModule } = require('./lib/sync/patch-template-app-module.cjs')
const { pruneStaleTemplateMirror } = require('./lib/prune/prune-stale-template-mirror.cjs')
const { writeEntityGraphManifest } = require('./lib/graph/entity-graph-manifest.cjs')

const SYNC_HELP = `
api:sync-template — copy apps/main/api → packages/api-server/deploy/nest

  pnpm api:sync-template
  pnpm api:sync-template -- --verbose

FLAGS
  --verbose   Log từng file spec/prune (mặc định: chỉ tóm tắt từng bước)
  --quiet     Chỉ in tóm tắt cuối (hoặc im lặng hoàn toàn khi gọi từ script)

MIRROR
  Trước copy: wipe src/* có ở main + xóa thư mục/file orphan (trừ src/common).
  deploy/nest mirror 100% apps/main/api — không sót file/module cũ.
`.trim()

function shouldSkipFile(name) {
  return SYNC_SKIP_FILE_PATTERNS.some((re) => re.test(name))
}

function removePath(absPath) {
  if (!fs.existsSync(absPath)) return
  fs.rmSync(absPath, { recursive: true, force: true })
}

function copyRecursive(src, dest, { rel = '' } = {}) {
  if (!fs.existsSync(src)) return 0
  let count = 0
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SYNC_SKIP_NAMES.has(entry.name)) continue
    if (!rel && SYNC_SKIP_ROOT_FILES.has(entry.name)) continue
    if (!entry.isDirectory() && shouldSkipFile(entry.name)) continue

    const relPath = path.posix.join(rel.replace(/\\/g, '/'), entry.name)
    if (entry.isDirectory() && rel.replace(/\\/g, '/') === 'src' && SYNC_SKIP_SRC_DIRS.has(entry.name)) {
      continue
    }
    if (entry.isDirectory() && relPath === 'src/common') continue

    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      count += copyRecursive(srcPath, destPath, { rel: path.join(rel, entry.name) })
      continue
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.copyFileSync(srcPath, destPath)
    count++
  }
  return count
}

function patchTemplatePackageJson(destRoot) {
  const pkgPath = path.join(destRoot, 'package.json')
  if (!fs.existsSync(pkgPath)) return
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.name = '@workspace/api-server/template'
  pkg.description =
    'NestJS API template — kế thừa local src/common/crud + module-bases. Cập nhật: pnpm api:sync-template'
  pkg.private = true
  if (pkg.dependencies?.['@workspace/api-server']) {
    delete pkg.dependencies['@workspace/api-server']
  }
  if (pkg.scripts?.predev) {
    pkg.scripts.predev = 'node ../../../../script-system/dev/dev-prep-api.cjs 3002'
  }
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
}

function writeTemplateMeta(destRoot) {
  const modules = listTemplateModuleIds(destRoot)
  const meta = {
    kind: 'nestjs-api-template',
    source: MAIN_API_PATH,
    syncedAt: new Date().toISOString(),
    moduleCount: modules.length,
    modules,
    oop: {
      pattern:
        'Module mỏng extends Base* local — src/common/crud + src/common/module-bases',
      shell: [
        'src/main.ts',
        'src/app.module.ts',
        'src/common/crud',
        'src/common/module-bases',
        'src/common/module-types',
        'src/config',
        'src/entities',
        'src/mikro-orm',
      ],
    },
  }
  fs.writeFileSync(
    path.join(destRoot, 'TEMPLATE.meta.json'),
    `${JSON.stringify(meta, null, 2)}\n`,
    'utf8',
  )
}

function cleanTemplateSpecs(destRoot) {
  const srcDir = path.join(destRoot, 'src')
  if (!fs.existsSync(srcDir)) return
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const moduleDir = path.join(srcDir, entry.name)
      for (const file of fs.readdirSync(moduleDir)) {
        if (shouldSkipFile(file)) {
          fs.unlinkSync(path.join(moduleDir, file))
        }
      }
      continue
    }
    if (shouldSkipFile(entry.name)) removePath(path.join(srcDir, entry.name))
  }
}

function pruneEmptySkipDirs(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const srcDir = path.join(destRoot, 'src')
  if (!fs.existsSync(srcDir)) return 0
  let removed = 0
  for (const name of SYNC_SKIP_SRC_DIRS) {
    const dir = path.join(srcDir, name)
    if (!fs.existsSync(dir)) continue
    if (fs.readdirSync(dir).length > 0) continue
    fs.rmdirSync(dir)
    removed++
    log.detail('sync:template', `removed empty src/${name}/`)
  }
  return removed
}

/**
 * @param {{ quiet?: boolean, verbose?: boolean, printSummary?: boolean }} [options]
 */
function syncApiTemplate(options = {}) {
  const quiet = options.quiet ?? parseQuietFlag()
  const verbose = options.verbose ?? parseVerboseFlag()
  const log = createLogger({ quiet, verbose })
  const logOpts = { quiet, verbose, log }

  const srcRoot = path.join(ROOT, MAIN_API_PATH)
  const destRoot = resolveTemplateRoot()

  if (!fs.existsSync(path.join(srcRoot, 'src', 'main.ts'))) {
    throw new Error(`[sync:template] Thiếu ${MAIN_API_PATH}/src/main.ts`)
  }

  if (!quiet) {
    log.step('sync:template', `apps/main/api → deploy/nest${verbose ? ' (verbose)' : ''}`)
  }

  fs.mkdirSync(destRoot, { recursive: true })
  const mirror = pruneStaleTemplateMirror(destRoot, logOpts)
  const copied = copyRecursive(srcRoot, destRoot)
  removePath(path.join(destRoot, '.graphify'))

  syncCommonRoot(destRoot, logOpts)
  syncModuleTypes(destRoot)
  syncCrudRuntime(destRoot, logOpts)
  syncModuleBases(destRoot, logOpts)

  const inherit = materializeInheritanceBindings(destRoot, logOpts)
  const pkgBind = materializePackageModuleBindings(destRoot, logOpts)

  const prunedThin = pruneThinModuleRedundantFiles(destRoot, logOpts)
  const prunedCommon = pruneCommonRuntime(destRoot, logOpts)
  cleanTemplateSpecs(destRoot)
  pruneEmptySkipDirs(destRoot, logOpts)
  const contractSpecs = syncContractSpecs(destRoot, logOpts)
  const moduleSpecsResult = syncModuleServiceSpecs(destRoot, logOpts)
  patchTemplateAppModule(destRoot, logOpts)

  patchTemplatePackageJson(destRoot)
  writeTemplateMeta(destRoot)
  const entityGraph = writeEntityGraphManifest(ROOT, logOpts)

  const moduleCount = listTemplateModuleIds(destRoot).length
  const stats = {
    copied,
    moduleCount,
    mirror,
    prunedThin,
    prunedCommon,
    contractSpecs,
    moduleSpecs: moduleSpecsResult.copied,
    moduleSpecSkipped: moduleSpecsResult.skipped,
    pkgBind,
    inherit,
    verbose,
    entityGraph: entityGraph.graph.entityCount,
  }

  if (options.printSummary !== false && !quiet) {
    printSyncTemplateSummary(stats)
  }

  return stats
}

if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(SYNC_HELP)
    process.exit(0)
  }
  syncApiTemplate({ printSummary: true })
}

module.exports = { syncApiTemplate, SYNC_HELP }
