/**
 * Registry Base* template từ packages/api-server/src/modules.
 *
 * - sync-template: vend active thin → deploy/nest/src/common/module-bases/
 * - api:render: copy shell module-bases + module-types + crud kèm app module
 *
 * materialize: 'thin' = sinh binding extends Base* (package-module-bindings.cjs)
 *              'mirror' = giữ mirror apps/main/api (mặc định)
 */
const fs = require('node:fs')
const path = require('node:path')
const { PACKAGE_ROOT, ROOT } = require('../cli/lib/monorepo-root.cjs')
const { writeFileWithRetry } = require('../cli/lib/fs-write-retry.cjs')
const { MAIN_API_PATH } = require('./product-lines.cjs')

const PKG_MODULES = path.join(PACKAGE_ROOT, 'src', 'modules')
const SKIP_FILE = /\.(spec|integration\.spec)\.ts$/

/** packageDir → template moduleId (khi khác tên folder). */
const PACKAGE_DIR_TO_MODULE_ID = {
  course: 'courses',
  courses: 'courses',
  speaker: 'speakers',
  speakers: 'speakers',
  camera: 'cameras',
  cameras: 'cameras',
  location: 'locations',
  locations: 'locations',
  major: 'majors',
  majors: 'majors',
  department: 'departments',
  departments: 'departments',
  template: 'templates',
  templates: 'templates',
  screen: 'screens',
  screens: 'screens',
  tag: 'tags',
  tags: 'tags',
  role: 'roles',
  roles: 'roles',
  order: 'orders',
  orders: 'orders',
  product: 'products',
  products: 'products',
  message: 'messages',
  messages: 'messages',
  group: 'groups',
  groups: 'groups',
  student: 'students',
  students: 'students',
  setting: 'settings',
  settings: 'settings',
  'academic-year': 'academic-years',
  'training-level': 'training-levels',
  'training-system': 'training-systems',
  'seo-meta': 'seo-metas',
  'event-checkout': 'event-checkouts',
  'imported-user': 'imported-users',
  'promo-code': 'promo-codes',
  'face-data': 'face-data',
  'page-content': 'page-contents',
  'contact-request': 'contact-requests',
  'parent-student': 'parent-students',
  'admission-result': 'admission-results',
  'verification-token': 'verification-tokens',
  'storage-file': 'storage-files',
  'customer-cart': 'customer-carts',
  'post-category': 'post-categories',
  'post-tag': 'post-tags',
  'user-role': 'user-roles',
  'group-member': 'group-members',
  'message-read': 'message-reads',
}

/** Module không sinh binding mỏng (multi-service folder / không có service chuẩn). */
const SKIP_THIN_MODULE_IDS = new Set([
  'public',
  'socket',
  'proxy-image',
  'seeders',
  'hanet',
  'messages',
  'uploads',
])

function resolveControllerPathAt(base, moduleId) {
  const standard = path.join(base, `${moduleId}.controller.ts`)
  if (fs.existsSync(standard)) return standard
  const { MANUAL_PACKAGE_MODULE_OVERRIDES } = require('./manual-package-module-overrides.cjs')
  const alt = MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]?.controllerFile
  if (alt && fs.existsSync(path.join(base, alt))) return path.join(base, alt)
  return null
}

function resolveControllerPath(moduleId) {
  return resolveControllerPathAt(path.join(ROOT, MAIN_API_PATH, 'src', moduleId), moduleId)
}

function hasStandardBindingPaths(moduleId) {
  const candidates = [
    path.join(ROOT, MAIN_API_PATH, 'src', moduleId),
    path.join(PACKAGE_ROOT, 'deploy/nest/src', moduleId),
  ]
  for (const base of candidates) {
    if (!fs.existsSync(path.join(base, `${moduleId}.service.ts`))) continue
    if (resolveControllerPathAt(base, moduleId)) return true
  }
  return false
}

function mainHasStandardBindingPaths(moduleId) {
  return hasStandardBindingPaths(moduleId)
}

function resolveMaterialize(moduleId, primary) {
  if (SKIP_THIN_MODULE_IDS.has(moduleId)) return 'mirror'
  if (primary?.service && primary?.controller && mainHasStandardBindingPaths(moduleId)) {
    return 'thin'
  }
  return 'mirror'
}

function resolveModuleId(packageDir) {
  return PACKAGE_DIR_TO_MODULE_ID[packageDir] ?? packageDir
}

function scanTsFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const bases = { services: [], controllers: [], modules: [] }
  for (const m of content.matchAll(/export (?:abstract )?class (Base\w+)/g)) {
    const className = m[1]
    const file = path.basename(filePath)
    if (className.endsWith('Service')) bases.services.push({ className, file })
    else if (className.endsWith('Controller')) bases.controllers.push({ className, file })
    else if (className.endsWith('Module')) bases.modules.push({ className, file })
  }
  return bases
}

function scanPackageModuleDir(packageDir) {
  const abs = path.join(PKG_MODULES, packageDir)
  if (!fs.existsSync(abs)) return null

  const merged = { services: [], controllers: [], modules: [] }
  const files = []
  for (const name of fs.readdirSync(abs)) {
    if (!name.endsWith('.ts') || SKIP_FILE.test(name)) continue
    files.push(name)
    const part = scanTsFile(path.join(abs, name))
    merged.services.push(...part.services)
    merged.controllers.push(...part.controllers)
    merged.modules.push(...part.modules)
  }

  const moduleId = resolveModuleId(packageDir)
  const primaryService = pickPrimary(merged.services, moduleId, 'Service')
  const primaryController = pickPrimary(merged.controllers, moduleId, 'Controller')
  const primaryModule = pickPrimary(merged.modules, moduleId, 'Module')

  return {
    packageDir,
    moduleId,
    materialize: resolveMaterialize(moduleId, {
      service: primaryService,
      controller: primaryController,
    }),
    bases: merged,
    primary: {
      service: primaryService,
      controller: primaryController,
      module: primaryModule,
    },
    files: files.sort(),
  }
}

function pickPrimary(list, moduleId, suffix) {
  if (!list.length) return null
  const moduleSlug = moduleId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  const ideal = list.find((x) => x.className === `Base${moduleSlug}${suffix}`)
  if (ideal) return ideal
  const slug = moduleId.replace(/-/g, '')
  const exact = list.find((x) =>
    x.className.toLowerCase().includes(slug.replace(/s$/, '')),
  )
  return exact ?? list[0]
}

function listPackageModuleDirs() {
  if (!fs.existsSync(PKG_MODULES)) return []
  return fs
    .readdirSync(PKG_MODULES, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b))
}

function buildPackageModuleTemplates() {
  const byPackageDir = {}
  const byModuleId = {}

  for (const packageDir of listPackageModuleDirs()) {
    const entry = scanPackageModuleDir(packageDir)
    if (!entry) continue
    byPackageDir[packageDir] = entry
    if (!byModuleId[entry.moduleId]) {
      byModuleId[entry.moduleId] = entry
    }
  }

  return { byPackageDir, byModuleId }
}

let _cache
function getPackageModuleTemplates() {
  if (!_cache) _cache = buildPackageModuleTemplates()
  return _cache
}

function listModuleBasePackageDirs() {
  return listPackageModuleDirs()
}

function listModuleBaseModuleIds() {
  const { byModuleId } = getPackageModuleTemplates()
  return Object.keys(byModuleId).sort((a, b) => a.localeCompare(b))
}

function getTemplateForModuleId(moduleId) {
  return getPackageModuleTemplates().byModuleId[moduleId] ?? null
}

function listThinMaterializeModuleIds() {
  return listModuleBaseModuleIds().filter(
    (id) => getTemplateForModuleId(id)?.materialize === 'thin',
  )
}

function writeTemplatesMeta(destRoot) {
  const { byModuleId } = getPackageModuleTemplates()
  const modules = Object.values(byModuleId).map((t) => ({
    moduleId: t.moduleId,
    packageDir: t.packageDir,
    materialize: t.materialize,
    primaryService: t.primary.service?.className ?? null,
    primaryController: t.primary.controller?.className ?? null,
    primaryModule: t.primary.module?.className ?? null,
    serviceCount: t.bases.services.length,
    controllerCount: t.bases.controllers.length,
    moduleCount: t.bases.modules.length,
  }))

  const meta = {
    kind: 'package-module-templates',
    source: 'packages/api-server/src/modules',
    referencePath: 'packages/api-server/src/modules',
    activePath: 'src/common/module-bases',
    syncedAt: new Date().toISOString(),
    moduleCount: modules.length,
    thinMaterialize: listThinMaterializeModuleIds(),
    crudMaterialize: modules.filter((m) => m.materialize === 'crud').map((m) => m.moduleId),
    modules,
  }

  const pipelineDir = path.join(destRoot, '.pipeline')
  fs.mkdirSync(pipelineDir, { recursive: true })
  const outPath = path.join(pipelineDir, 'PACKAGE_MODULE_TEMPLATES.meta.json')
  writeFileWithRetry(outPath, `${JSON.stringify(meta, null, 2)}\n`)
  return meta
}

module.exports = {
  PKG_MODULES,
  SKIP_THIN_MODULE_IDS,
  PACKAGE_DIR_TO_MODULE_ID,
  resolveControllerPath,
  getPackageModuleTemplates,
  listPackageModuleDirs,
  listModuleBasePackageDirs,
  listModuleBaseModuleIds,
  getTemplateForModuleId,
  listThinMaterializeModuleIds,
  writeTemplatesMeta,
}
