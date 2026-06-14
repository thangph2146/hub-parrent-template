/**
 * Vend CRUD + module-bases vào apps/main/api/src/common (local — không import runtime từ @workspace/api-server).
 *
 *   pnpm main-api:materialize-bases
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT, PACKAGE_ROOT } = require('./lib/monorepo-root.cjs')
const { createLogger } = require('./lib/cli-logger.cjs')
const { MAIN_API_PATH } = require('../config/product-lines.cjs')
const { syncCrudRuntime } = require('./lib/sync/sync-crud-runtime.cjs')
const { syncModuleBases, syncModuleTypes } = require('./lib/sync/sync-module-bases.cjs')

const PKG_COMMON = path.join(PACKAGE_ROOT, 'src/common')

const COMMON_SHIM_SKIP = new Set([
  'apply-column-filters.ts',
  'build-admin-list-params.ts',
  'index.ts',
])

function isSpecFile(name) {
  return /\.(spec|integration\.spec)\.ts$/.test(name)
}

function syncMainApiCommonShims(destRoot) {
  const dest = path.join(destRoot, 'src/common')
  let count = 0
  for (const file of fs.readdirSync(PKG_COMMON)) {
    if (!file.endsWith('.ts')) continue
    if (COMMON_SHIM_SKIP.has(file) || isSpecFile(file)) continue
    const destFile = path.join(dest, file)
    if (fs.existsSync(destFile)) continue
    fs.copyFileSync(path.join(PKG_COMMON, file), destFile)
    count++
  }
  return count
}

function writeModuleTypesBarrel(destRoot) {
  const destDir = path.join(destRoot, 'src/common/module-types')
  const dest = path.join(destDir, 'index.ts')
  fs.writeFileSync(
    dest,
    `/** Barrel module-types — local (pnpm main-api:materialize-bases). */
export * from './crud.types';
export * from './common.types';
export type {
  UserRowDto,
  UserRoleDto,
  PaginationMeta,
  PaginatedResult,
  ListUsersParams,
  CreateUserData,
  UpdateUserData,
  UserOption,
  DevLoginRole,
  DevLoginOption,
  DevLoginOptionsQuery,
} from './user.types';
`,
    'utf8',
  )
}

function rewriteMainApiCommonIndex(destRoot) {
  const dest = path.join(destRoot, 'src/common')
  const shimExports = fs
    .readdirSync(dest)
    .filter(
      (f) =>
        f.endsWith('.ts') &&
        !isSpecFile(f) &&
        f !== 'index.ts' &&
        !COMMON_SHIM_SKIP.has(f),
    )
    .sort()
    .map((f) => `export * from './${f.replace(/\.ts$/, '')}';`)

  const crudExports = `export {
  buildAdminListCrudParams,
  type AdminListQueryInput,
  type StandardAdminListParams,
  type StandardAdminListResult,
  type AdminCrudControllerConfig,
  type IAdminCrudControllerService,
  type ICrudControllerService,
  type CrudRowDto,
  type ListCrudParams,
} from './crud';`

  const content = `/** Main API common — local utilities + app modules + CRUD/module bases. */
/** AUTO: pnpm main-api:materialize-bases */
${shimExports.join('\n')}
${crudExports}
export * from './admin';
export * from './commerce';
export * from './infra';
export * from './app';
`
  fs.writeFileSync(path.join(dest, 'index.ts'), content, 'utf8')
}

function patchMainApiCommonIndex(destRoot) {
  writeModuleTypesBarrel(destRoot)
  rewriteMainApiCommonIndex(destRoot)
}

const HELP = `
main-api:materialize-bases — vend Base* local vào apps/main/api/src/common

  pnpm main-api:materialize-bases

Sinh:
  src/common/crud/           ← packages/api-server/src/bases + common
  src/common/module-bases/   ← packages/api-server/src/modules (thin)
  src/common/module-types/   ← packages/api-server/src/types

Giữ nguyên admin/commerce/infra/app — copy thêm utility shim từ pkg common (bulk-actions, entity-id, …).
`.trim()

function materializeMainApiBases(options = {}) {
  const log = options.log ?? createLogger(options)
  const destRoot = path.join(ROOT, MAIN_API_PATH)

  const shimCount = syncMainApiCommonShims(destRoot)
  const typeCount = syncModuleTypes(destRoot)
  syncCrudRuntime(destRoot, { log, ...options })
  const { moduleIds, fileCount } = syncModuleBases(destRoot, {
    log,
    skipBarrel: true,
    skipAppConfig: false,
    skipModuleTypes: true,
    ...options,
  })
  patchMainApiCommonIndex(destRoot)

  log.step(
    'materialize:main-api-bases',
    `shims=${shimCount} · crud+types=${typeCount} file · module-bases=${moduleIds.length} module (${fileCount} file)`,
  )

  return { moduleIds, fileCount, typeCount }
}

if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(HELP)
    process.exit(0)
  }
  materializeMainApiBases()
}

module.exports = { materializeMainApiBases, patchMainApiCommonIndex }
