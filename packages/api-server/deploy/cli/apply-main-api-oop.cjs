/**
 * Chuẩn hóa apps/main/api — service/controller extends Base* local (src/common/module-bases).
 *
 *   node packages/api-server/deploy/cli/apply-main-api-oop.cjs
 *   node packages/api-server/deploy/cli/apply-main-api-oop.cjs --module=departments
 *   node packages/api-server/deploy/cli/apply-main-api-oop.cjs --all --dry-run
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('./lib/monorepo-root.cjs')
const { MAIN_API_PATH } = require('../config/product-lines.cjs')
const {
  getPackageBaseModules,
  parsePackageModuleBinding,
} = require('../config/package-module-bindings.cjs')
const {
  COPY_ONLY_MODULE_IDS,
  mainModulePaths,
} = require('../config/module-bindings.cjs')
const { SKIP_THIN_MODULE_IDS, listThinMaterializeModuleIds } = require('../config/package-module-templates.cjs')
const { MANUAL_PACKAGE_MODULE_OVERRIDES } = require('../config/manual-package-module-overrides.cjs')
const {
  renderMainApiService,
  renderMainApiController,
  localBaseServiceImport,
} = require('./lib/sync/render-main-api-oop.cjs')
const {
  renderMainApiServiceSpec,
  readPackageBaseServiceSrc,
} = require('./lib/sync/render-main-api-service-spec.cjs')

const HELP = `
main-api OOP — apps/main/api extends local Base* (src/common/module-bases)

  pnpm main-api:materialize-bases   # vend base trước khi apply OOP
  node packages/api-server/deploy/cli/apply-main-api-oop.cjs --all
  node packages/api-server/deploy/cli/apply-main-api-oop.cjs --module=departments
  node packages/api-server/deploy/cli/apply-main-api-oop.cjs --all --dry-run
  node packages/api-server/deploy/cli/apply-main-api-oop.cjs --all --force
  node packages/api-server/deploy/cli/apply-main-api-oop.cjs --specs-only --all

Chỉ module có Base* trong src/common/module-bases (pnpm main-api:materialize-bases).
Giữ nguyên: public, auth, system, uploads, categories/posts/users custom domain.
`.trim()

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run')
  const all = argv.includes('--all')
  const specsOnly = argv.includes('--specs-only')
  const force = argv.includes('--force')
  const moduleArg = argv.find((a) => a.startsWith('--module='))
  const module = moduleArg ? moduleArg.slice('--module='.length) : null
  return { dryRun, all, module, specsOnly, force }
}

function packageServiceMethods(packageBaseSrc) {
  const methods = new Set()
  if (!packageBaseSrc) return methods
  for (const m of packageBaseSrc.matchAll(/\n\s+async\s+(\w+)\s*\(/g)) {
    methods.add(m[1])
  }
  return methods
}

function packageAbsorbsMainCrud(moduleId, config, serviceSrc) {
  const baseSrc = readPackageBaseServiceSrc(moduleId, config)
  if (!baseSrc) return false
  if (/async list\s*\(/.test(baseSrc)) return true
  if (/function buildWhere\s*\(/.test(baseSrc)) return true
  if (/protected buildWhere\s*\(/.test(baseSrc)) return true
  if (/extends BaseCrudService/.test(baseSrc)) {
    return (
      serviceSrc.includes('buildStandardAdminWhere') &&
      !/function buildWhere\s*\(/.test(serviceSrc)
    )
  }
  return false
}

function mainModuleDir(moduleId) {
  return path.join(ROOT, MAIN_API_PATH, 'src', moduleId)
}

function isAlreadyOop(servicePath) {
  if (!fs.existsSync(servicePath)) return false
  const src = fs.readFileSync(servicePath, 'utf8')
  return (
    /extends Base\w+Service/.test(src) &&
    (src.includes('../common/module-bases/') || src.includes('@workspace/api-server/modules/'))
  )
}

const EXTRA_SERVICE_METHOD_ALLOW = new Set([
  'getOptions',
  'getUsage',
  'listPublic',
])

function extensionCoversExtraMethods(moduleId, serviceSrc) {
  const config = getPackageBaseModules()[moduleId]
  const ext = config?.serviceExtensions
  if (!ext?.methods?.length) return false
  const packageBaseSrc = readPackageBaseServiceSrc(moduleId, config)
  const extras = extraPublicServiceMethods(serviceSrc, packageBaseSrc, moduleId)
  if (!extras.length) return true
  return extras.every((name) => ext.methods.includes(name))
}

function extraPublicServiceMethods(serviceSrc, packageBaseSrc = '', moduleId = '') {
  const standard = new Set([
    'list',
    'getById',
    'create',
    'update',
    'softDelete',
    'restore',
    'hardDelete',
    'bulk',
    'bulkAction',
    ...EXTRA_SERVICE_METHOD_ALLOW,
  ])
  const pkgMethods = packageServiceMethods(packageBaseSrc)
  const extras = new Set()
  for (const m of serviceSrc.matchAll(/\n\s+async\s+(\w+)\s*\(/g)) {
    const name = m[1]
    if (standard.has(name) || pkgMethods.has(name)) continue
    if (name === 'bulk' && pkgMethods.has('bulkAction')) continue
    if (moduleId === 'contact-requests' && name === 'assign') continue
    extras.add(name)
  }
  return [...extras]
}

function isComplexStandardAdminModule(moduleId) {
  const config = getPackageBaseModules()[moduleId]
  const ext = config?.serviceExtensions
  if (ext?.extraConstructorParams || ext?.methods?.length) return false

  const { service } = mainModulePaths(moduleId)
  if (!fs.existsSync(service)) return true
  const content = fs.readFileSync(service, 'utf8')
  if (isAlreadyOop(service)) return false
  return /constructor\s*\(\s*[^)]*,/.test(content)
}

function eligibilityReason(moduleId, { force = false } = {}) {
  if (COPY_ONLY_MODULE_IDS.has(moduleId)) return 'mirror-only'
  if (SKIP_THIN_MODULE_IDS.has(moduleId)) return 'thin-skip'
  if (MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]?.skipOop) return 'commerce-custom'
  if (!listThinMaterializeModuleIds().includes(moduleId)) return 'not-thin-template'
  const { service: servicePath } = mainModulePaths(moduleId)
  if (!fs.existsSync(servicePath)) return 'missing-service'

  const config = getPackageBaseModules()[moduleId]
  if (!config) return 'no-package-base'
  const packageBaseSrc = readPackageBaseServiceSrc(moduleId, config)

  const override = MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]
  if (override?.customService) return 'custom-service'

  if (isAlreadyOop(servicePath)) {
    return force ? null : 'already-oop'
  }

  if (isComplexStandardAdminModule(moduleId)) return 'complex-deps'
  const serviceSrc = fs.readFileSync(servicePath, 'utf8')
  if (/function buildWhere\s*\(/.test(serviceSrc) && !packageAbsorbsMainCrud(moduleId, config, serviceSrc)) {
    return 'custom-buildWhere'
  }
  if (extensionCoversExtraMethods(moduleId, serviceSrc)) {
    const meta = parsePackageModuleBinding(moduleId, config)
    return meta ? null : 'parse-binding-failed'
  }
  const extras = extraPublicServiceMethods(serviceSrc, packageBaseSrc, moduleId)
  if (extras.length) return `extra-methods:${extras.join(',')}`
  const meta = parsePackageModuleBinding(moduleId, config)
  if (!meta) return 'parse-binding-failed'
  return null
}

const MAIN_API_BANNER =
  '/** NestJS OOP — extends local Base* (src/common/module-bases); binding tại apps/main/api. */\n'

function writeCompanionServices(moduleId, dryRun) {
  const override = MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]
  if (!override?.companionServices) return []

  const written = []

  for (const [fileName, rawSrc] of Object.entries(override.companionServices)) {
    let content = rawSrc.replace(/\r\n/g, '\n')
    content = content.replace(/\/\*\* AUTO-GENERATED[^*]*\*\/\n?/, MAIN_API_BANNER)
    const dest = path.join(mainModuleDir(moduleId), fileName)
    if (!dryRun) {
      fs.writeFileSync(dest, content, 'utf8')
    }
    written.push(dest)
  }

  return written
}

function listTargetModules(moduleFilter) {
  const ids = listThinMaterializeModuleIds().filter((id) => getPackageBaseModules()[id]).sort()
  if (moduleFilter) {
    if (!ids.includes(moduleFilter)) {
      throw new Error(`Không có package-base cho module: ${moduleFilter}`)
    }
    return [moduleFilter]
  }
  return ids
}

function listOopModuleIds(moduleFilter) {
  return listTargetModules(moduleFilter).filter((moduleId) => {
    const { service: servicePath } = mainModulePaths(moduleId)
    return fs.existsSync(servicePath) && isAlreadyOop(servicePath)
  })
}

function applyMainApiOop({
  dryRun = false,
  module = null,
  all = false,
  specsOnly = false,
  force = false,
} = {}) {
  if (!all && !module) {
    console.log(HELP)
    return { applied: [], skipped: [] }
  }

  const applied = []
  const skipped = []

  const moduleIds = specsOnly ? listOopModuleIds(module) : listTargetModules(module)

  for (const moduleId of moduleIds) {
    const reason = specsOnly ? null : eligibilityReason(moduleId, { force })
    if (reason) {
      skipped.push({ moduleId, reason })
      continue
    }

    const config = getPackageBaseModules()[moduleId]
    const meta = parsePackageModuleBinding(moduleId, config)
    if (!meta) {
      skipped.push({ moduleId, reason: 'parse-binding-failed' })
      continue
    }

    const { service: servicePath, controller: controllerPath } = mainModulePaths(moduleId)
    const specPath = path.join(mainModuleDir(moduleId), `${moduleId}.service.spec.ts`)
    const legacyServiceSrc = fs.existsSync(servicePath)
      ? fs.readFileSync(servicePath, 'utf8')
      : meta.serviceSrc

    if (!specsOnly) {
      const serviceSrc = renderMainApiService(meta, moduleId)
      const controllerSrc = renderMainApiController(meta, moduleId)

      if (dryRun) {
        applied.push({ moduleId, servicePath, controllerPath, specPath, dryRun: true })
        continue
      }

      fs.writeFileSync(servicePath, serviceSrc.replace(/\r\n/g, '\n'), 'utf8')
      const preserveController =
        MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]?.preserveController === true
      if (!preserveController) {
        fs.writeFileSync(controllerPath, controllerSrc.replace(/\r\n/g, '\n'), 'utf8')
      }
    writeCompanionServices(moduleId, dryRun)
    }

    const specSrc = renderMainApiServiceSpec(
      meta,
      moduleId,
      legacyServiceSrc,
      readPackageBaseServiceSrc(moduleId, config),
    )
    if (!dryRun) {
      fs.writeFileSync(specPath, specSrc.replace(/\r\n/g, '\n'), 'utf8')
    }

    applied.push({
      moduleId,
      servicePath,
      controllerPath,
      specPath,
      specsOnly,
      dryRun,
    })
  }

  return { applied, skipped }
}

if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(HELP)
    process.exit(0)
  }

  const { dryRun, all, module, specsOnly, force } = parseArgs(process.argv.slice(2))
  const { applied, skipped } = applyMainApiOop({
    dryRun,
    all: all || Boolean(module),
    module,
    specsOnly,
    force,
  })

  for (const row of applied) {
    const action = dryRun ? 'would write' : 'wrote'
    const suffix = row.specsOnly ? ' (spec)' : ''
    console.log(`[main-api:oop] ${action} ${row.moduleId}${suffix}`)
  }
  for (const row of skipped) {
    console.log(`[main-api:oop] skip ${row.moduleId} (${row.reason})`)
  }
  console.log(
    `[main-api:oop] ${applied.length} module · ${skipped.length} skip${dryRun ? ' (dry-run)' : ''}`,
  )
}

module.exports = { applyMainApiOop, eligibilityReason }
