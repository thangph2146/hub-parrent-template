/**
 * Tự sinh config binding mỏng extends Base* từ template + main/api.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../cli/lib/monorepo-root.cjs')
const { MAIN_API_PATH } = require('./product-lines.cjs')
const {
  getPackageModuleTemplates,
  PKG_MODULES,
  SKIP_THIN_MODULE_IDS,
  resolveControllerPath,
} = require('./package-module-templates.cjs')
const { MANUAL_PACKAGE_MODULE_OVERRIDES } = require('./manual-package-module-overrides.cjs')

function moduleIdToClassPrefix(moduleId) {
  return moduleId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function mainModulePaths(moduleId) {
  const base = path.join(ROOT, MAIN_API_PATH, 'src', moduleId)
  const override = MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]
  const controller =
    resolveControllerPath(moduleId) ??
    path.join(base, override?.controllerFile ?? `${moduleId}.controller.ts`)
  return {
    service: path.join(base, `${moduleId}.service.ts`),
    controller,
    module: path.join(base, `${moduleId}.module.ts`),
  }
}

function parseEntityImports(mainServiceSrc) {
  const out = []
  for (const m of mainServiceSrc.matchAll(
    /import \{([^}]+)\} from '\.\.\/entities\/([^']+)'/g,
  )) {
    for (const part of m[1].split(',')) {
      const className = part.trim().replace(/^type\s+/, '')
      if (!className) continue
      out.push({
        className,
        importPath: `../entities/${m[2]}`,
      })
    }
  }
  return out
}

function inferEntityHooks(mainServiceSrc, baseServiceSrc) {
  const entityImports = parseEntityImports(mainServiceSrc)
  const hooks = []

  const abstractEntityHooks = [
    ...baseServiceSrc.matchAll(/protected abstract get(\w*)Entity\(\)/g),
  ]
  for (const m of abstractEntityHooks) {
    const suffix = m[1]
    const method = suffix ? `get${suffix}Entity` : 'getEntity'
    let pick =
      method === 'getEntity'
        ? entityImports[0]
        : entityImports.find((e) =>
            e.className.toLowerCase().includes(suffix.toLowerCase()),
          )
    if (!pick && entityImports.length === 1) pick = entityImports[0]
    if (pick) {
      hooks.push({
        method,
        entity: pick.className,
        importPath: pick.importPath,
      })
    }
  }

  return hooks
}

function extractTypeExportsFromBase(baseServiceSrc) {
  const names = []
  for (const m of baseServiceSrc.matchAll(/^export (?:type )?(?:interface|type) (\w+)/gm)) {
    names.push(m[1])
  }
  return [...new Set(names)]
}

function buildAutoModuleConfig(moduleId, template) {
  const { service, controller } = mainModulePaths(moduleId)
  if (!fs.existsSync(service) || !fs.existsSync(controller)) return null
  if (!template.primary?.service || !template.primary?.controller) return null

  const serviceFile = template.primary.service.file
  const controllerFile = template.primary.controller.file
  const packageDir = template.packageDir
  const mainServiceSrc = fs.readFileSync(service, 'utf8')
  const baseServicePath = path.join(PKG_MODULES, packageDir, serviceFile)
  if (!fs.existsSync(baseServicePath)) return null
  const baseServiceSrc = fs.readFileSync(baseServicePath, 'utf8')

  const entityHooks = inferEntityHooks(mainServiceSrc, baseServiceSrc)
  const needsEm =
    /protected abstract getEm\(\)/.test(baseServiceSrc) ||
    /getEm\(\):\s*EntityManager\s*\{\s*throw new Error/.test(baseServiceSrc)

  const needsEntityHooks = /protected abstract get(\w*)Entity\(\)/.test(baseServiceSrc)
  if (needsEntityHooks && entityHooks.length === 0) {
    return null
  }

  const serviceStem = serviceFile.replace(/\.ts$/, '')
  const controllerStem = controllerFile.replace(/\.ts$/, '')
  const serviceTypeExports = extractTypeExportsFromBase(baseServiceSrc)

  return {
    baseServiceClass: template.primary.service.className,
    baseControllerClass: template.primary.controller.className,
    baseModuleSubpath: packageDir,
    packageDir,
    baseServiceImport: `../common/module-bases/${packageDir}/${serviceStem}`,
    baseControllerImport: `../common/module-bases/${packageDir}/${controllerStem}`,
    serviceClass: `${moduleIdToClassPrefix(moduleId)}Service`,
    controllerClass: `${moduleIdToClassPrefix(moduleId)}Controller`,
    entityHooks,
    needsEm,
    serviceTypeExports,
    autoController: true,
    controllerClass:
      MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]?.controllerClass ??
      `${moduleIdToClassPrefix(moduleId)}Controller`,
  }
}

function mergeModuleConfig(moduleId, baseConfig) {
  const override = MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]
  if (!baseConfig) return override ?? null
  if (!override) return baseConfig
  return {
    ...baseConfig,
    ...override,
    entityHooks: override.entityHooks ?? baseConfig.entityHooks,
    constHooks: override.constHooks ?? baseConfig.constHooks,
  }
}

/** Config tay — override / side-effect (users, auth). */
const PACKAGE_BASE_MODULES_MANUAL = {
  auth: {
    baseServiceClass: 'BaseAuthService',
    baseControllerClass: 'BaseAuthController',
    baseModuleSubpath: 'auth',
    packageDir: 'auth',
    baseServiceImport: '../common/module-bases/auth/auth.service',
    baseControllerImport: '../common/module-bases/auth/auth.controller',
    serviceClass: 'AuthService',
    controllerClass: 'AuthController',
    entityHooks: [
      { method: 'getUserEntity', entity: 'User', importPath: '../entities/user.entity' },
    ],
    serviceTypeExports: ['AuthLoginPayload', 'AuthRolePayload', 'GoogleProfileDto'],
    serviceTypeAliases: [{ name: 'AuthUserPayload', type: 'AuthLoginPayload' }],
    needsEm: true,
    autoController: true,
    controllerSuperCall: 'super(service);',
    controllerParams: '@Inject(AuthService) service: AuthService',
  },
  users: {
    baseServiceClass: 'BaseUsersService',
    baseControllerClass: 'BaseUsersController',
    baseModuleSubpath: 'users',
    packageDir: 'users',
    baseServiceImport: '../common/module-bases/users/users.service',
    baseControllerImport: '../common/module-bases/users/users.controller',
    serviceClass: 'UsersService',
    controllerClass: 'UsersController',
    entityHooks: [
      { method: 'getUserEntity', entity: 'User', importPath: '../entities/user.entity' },
      { method: 'getRoleEntity', entity: 'Role', importPath: '../entities/role.entity' },
      {
        method: 'getUserRoleEntity',
        entity: 'UserRole',
        importPath: '../entities/user-role.entity',
      },
      { method: 'getSettingEntity', entity: 'Setting', importPath: '../entities/setting.entity' },
    ],
    serviceTypeExports: [],
    serviceTypeExportsFromModuleTypes: [
      'UserRowDto',
      'ListUsersParams',
      'PaginatedResult',
      'DevLoginOption',
      'DevLoginOptionsQuery',
      'DevLoginRole',
    ],
    serviceTypeAliases: [
      { name: 'ListUsersResult', type: 'PaginatedResult<UserRowDto>' },
      { name: 'DevLoginOptionDto', type: 'DevLoginOption' },
      { name: 'DevLoginRoleDto', type: 'DevLoginRole' },
    ],
    controllerOverrideMethods: [
      'create',
      'update',
      'bulk',
      'hardDelete',
      'softDelete',
      'restore',
    ],
    controllerPrivateHelpers: [
      'logActivity',
      'getUserId',
      'unauthorized',
      'revokeSessionsAndEmitAccountLocked',
    ],
    dtoImports: ['CreateUserDto', 'UpdateUserDto', 'BulkActionDto'],
    needsEm: true,
    autoController: false,
  },
}

function buildAllPackageBaseModules() {
  const { byModuleId } = getPackageModuleTemplates()
  const out = { ...PACKAGE_BASE_MODULES_MANUAL }

  for (const [moduleId, template] of Object.entries(byModuleId)) {
    if (out[moduleId]) continue
    if (SKIP_THIN_MODULE_IDS.has(moduleId)) continue
    if (template.materialize !== 'thin') continue
    const auto = buildAutoModuleConfig(moduleId, template)
    const merged = mergeModuleConfig(moduleId, auto)
    if (merged) out[moduleId] = merged
  }

  for (const [moduleId, override] of Object.entries(MANUAL_PACKAGE_MODULE_OVERRIDES)) {
    if (out[moduleId]?.customService) continue
    if (override.customService && templateHasPrimary(moduleId)) {
      const template = getPackageModuleTemplates().byModuleId[moduleId]
      if (!template) continue
      out[moduleId] = mergeModuleConfig(moduleId, buildAutoModuleConfig(moduleId, template) ?? {
        baseServiceClass: template.primary.service.className,
        baseControllerClass: template.primary.controller.className,
        packageDir: template.packageDir,
        baseModuleSubpath: template.packageDir,
        serviceClass: `${moduleIdToClassPrefix(moduleId)}Service`,
        controllerClass: `${moduleIdToClassPrefix(moduleId)}Controller`,
        autoController: true,
        entityHooks: [],
        needsEm: true,
      })
    }
  }

  return out
}

function templateHasPrimary(moduleId) {
  const t = getPackageModuleTemplates().byModuleId[moduleId]
  return Boolean(t?.primary?.service && t?.primary?.controller)
}

function listThinMaterializeModuleIdsFromBindings() {
  return Object.keys(buildAllPackageBaseModules()).sort()
}

module.exports = {
  PACKAGE_BASE_MODULES_MANUAL,
  buildAutoModuleConfig,
  buildAllPackageBaseModules,
  listThinMaterializeModuleIdsFromBindings,
  moduleIdToClassPrefix,
  mainModulePaths,
}
