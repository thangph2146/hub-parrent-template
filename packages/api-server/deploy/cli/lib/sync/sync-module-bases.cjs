/**
 * Vend packages/api-server/src/modules + src/types → template module-bases|module-types.
 */
const fs = require('node:fs')
const path = require('node:path')
const { PACKAGE_ROOT } = require('../monorepo-root.cjs')
const { ROOT } = require('../monorepo-root.cjs')
const { MAIN_API_PATH } = require('../../../config/product-lines.cjs')
const { createLogger } = require('../cli-logger.cjs')
const {
  listThinMaterializeModuleIds,
  writeTemplatesMeta,
  getTemplateForModuleId,
} = require('../../../config/package-module-templates.cjs')

const PKG_SRC = path.join(PACKAGE_ROOT, 'src')
const PKG_MODULES = path.join(PKG_SRC, 'modules')
const PKG_TYPES = path.join(PKG_SRC, 'types')
const PKG_COMMON_INDEX = path.join(PKG_SRC, 'common', 'index.ts')
const PKG_APP_CONFIG = path.join(PKG_SRC, 'config', 'app-config.ts')

const SKIP_FILE = /\.(spec|integration\.spec)\.ts$/

function rewriteModuleBaseImports(content) {
  let c = content
    .replace(/from '\.\.\/\.\.\/common'/g, "from '../../index'")
    .replace(/from '\.\.\/\.\.\/common\//g, "from '../../")
    .replace(/from '\.\.\/\.\.\/apply-column-filters'/g, "from '../../crud/crud-apply-column-filters'")
    .replace(/from '\.\.\/\.\.\/types'/g, "from '../../module-types'")
    .replace(/from '\.\.\/\.\.\/types\//g, "from '../../module-types/")
    .replace(/from '\.\.\/\.\.\/bases'/g, "from '../../crud'")
    .replace(/from '\.\.\/\.\.\/bases\//g, "from '../../crud/")
    .replace(/from '\.\.\/\.\.\/config\/app-config'/g, "from '../../../config/app-config'")
    .replace(/from '\.\.\/\.\.\/config\//g, "from '../../../config/")
    .replace(/@workspace\/api-server\/bases/g, 'src/common/crud')
    .replace(/@workspace\/api-server\/common/g, 'src/common')

  c = c.replace(/import \{([^}]+)\} from '\.\.\/\.\.\/config'/g, (_, body) => {
    const names = body.split(',').map((s) => s.trim()).filter(Boolean)
    const constants = names.filter((n) =>
      /^(ADMIN_ROUTES|APP_HEADERS|AUTH_ROLE|AUTH_ROLE_NAMES)/.test(n),
    )
    const perms = names.filter((n) => n === 'PERMISSIONS')
    const rest = names.filter((n) => !constants.includes(n) && !perms.includes(n))
    const lines = []
    if (constants.length) lines.push(`import { ${constants.join(', ')} } from '../../../config/constants';`)
    if (perms.length) lines.push(`import { PERMISSIONS } from '../../../config/permissions';`)
    if (rest.length) lines.push(`import { ${rest.join(', ')} } from '../../../config/constants';`)
    return lines.join('\n')
  })

  return c
}

function copyTsFiles(srcDir, destDir, { transform } = {}) {
  if (!fs.existsSync(srcDir)) return 0
  fs.mkdirSync(destDir, { recursive: true })
  let count = 0
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.isDirectory()) continue
    if (!entry.name.endsWith('.ts')) continue
    if (entry.name === 'index.ts') continue
    if (SKIP_FILE.test(entry.name)) continue
    let content = fs.readFileSync(path.join(srcDir, entry.name), 'utf8')
    if (transform) content = transform(content)
    fs.writeFileSync(path.join(destDir, entry.name), content, 'utf8')
    count++
  }
  return count
}

function writeCommonBarrel(destRoot) {
  if (!fs.existsSync(PKG_COMMON_INDEX)) return
  const dest = path.join(destRoot, 'src/common/index.ts')
  let content = fs.readFileSync(PKG_COMMON_INDEX, 'utf8')
  content = content
    .replace(/export \* from '\.\/apply-column-filters';\n?/g, '')
    .replace(/export \* from '\.\/build-admin-list-params';\n?/g, '')
  content = `/** Barrel common — template local (pnpm api:sync-template). */\n${content}`
  content += "\nexport { buildAdminListCrudParams, type AdminListQueryInput } from './crud/build-admin-list-params';\n"
  fs.writeFileSync(dest, content, 'utf8')
}

function copyAppConfig(destRoot) {
  if (!fs.existsSync(PKG_APP_CONFIG)) return
  const dest = path.join(destRoot, 'src/config/app-config.ts')
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(PKG_APP_CONFIG, dest)
}

function syncModuleTypes(destRoot) {
  const dest = path.join(destRoot, 'src/common/module-types')
  fs.mkdirSync(dest, { recursive: true })
  const count = copyTsFiles(PKG_TYPES, dest)
  const mainIndexAbs = path.join(ROOT, MAIN_API_PATH, 'src/common/module-types/index.ts')
  const pkgIndex = path.join(PKG_TYPES, 'index.ts')
  const indexSrc = fs.existsSync(mainIndexAbs) ? mainIndexAbs : pkgIndex
  if (fs.existsSync(indexSrc)) {
    let indexContent = fs.readFileSync(indexSrc, 'utf8')
    if (indexSrc === pkgIndex) {
      indexContent = `/** Barrel module-types — template (pnpm api:sync-template). */\n${indexContent}`
    }
    fs.writeFileSync(path.join(dest, 'index.ts'), indexContent, 'utf8')
  }
  return count + (fs.existsSync(indexSrc) ? 1 : 0)
}

function syncModuleBasePackageDir(packageDir, destRoot) {
  const template = getTemplateForModuleId(
    require('../../../config/package-module-templates.cjs').PACKAGE_DIR_TO_MODULE_ID[packageDir] ??
      packageDir,
  )
  if (template?.materialize !== 'thin') return 0

  const moduleId = template.moduleId
  const srcDir = path.join(PKG_MODULES, packageDir)
  const destDir = path.join(destRoot, 'src/common/module-bases', moduleId)
  if (!fs.existsSync(srcDir)) return 0

  fs.rmSync(destDir, { recursive: true, force: true })
  return copyTsFiles(srcDir, destDir, { transform: rewriteModuleBaseImports })
}

function syncModuleBases(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  if (!options.skipAppConfig) {
    copyAppConfig(destRoot)
  }
  const thinIds = listThinMaterializeModuleIds()
  let fileCount = 0

  for (const moduleId of thinIds) {
    const template = getTemplateForModuleId(moduleId)
    const packageDir = template?.packageDir ?? moduleId
    fileCount += syncModuleBasePackageDir(packageDir, destRoot)
  }

  const typeCount = options.skipModuleTypes ? 0 : syncModuleTypes(destRoot)
  if (!options.skipBarrel) {
    writeCommonBarrel(destRoot)
  }
  writeTemplatesMeta(destRoot)

  log.step(
    'sync:module-bases',
    `active=${thinIds.length} module (${fileCount} file) · types=${typeCount}`,
  )

  return { moduleIds: thinIds, fileCount, typeCount }
}

module.exports = {
  syncModuleBases,
  syncModuleTypes,
  rewriteModuleBaseImports,
  writeCommonBarrel,
}
