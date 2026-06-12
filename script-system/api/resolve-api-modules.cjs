/**
 * Resolve danh sách module API scaffold từ api.app.config.json.
 * Song song admin.app.config.json → modules trong @workspace/admin-app.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')

/** Admin module id → API folder (hub-checkin). */
const DEFAULT_ADMIN_MODULE_MAP = {
  staff: ['users'],
  rbac: ['roles', 'sessions', 'accounts'],
  categories: ['categories'],
  tags: ['tags'],
  guides: ['page-contents'],
  posts: ['posts'],
  cameras: ['cameras'],
  templates: ['templates'],
  screens: ['screens'],
  locations: ['locations'],
  speakers: ['speakers'],
  settings: ['settings'],
  'file-storage': ['uploads'],
  data: ['system'],
}

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'))
}

function expandAdminModules(adminModules, adminModuleMap) {
  const map = { ...DEFAULT_ADMIN_MODULE_MAP, ...adminModuleMap }
  const out = []
  for (const mod of adminModules ?? []) {
    const mapped = map[mod]
    if (!mapped) {
      out.push(mod)
      continue
    }
    if (Array.isArray(mapped)) out.push(...mapped)
    else out.push(mapped)
  }
  return out
}

/**
 * @param {string} appRel e.g. apps/hub-event/api
 */
function resolveApiModules(appRel) {
  const configPath = path.join(ROOT, appRel, 'api.app.config.json')
  if (!fs.existsSync(configPath)) {
    throw new Error(`Không tìm thấy api.app.config.json tại ${appRel}`)
  }
  const config = readJson(configPath)

  let modules = []
  if (config.modules?.length) {
    modules = [...config.modules]
  } else if (config.scaffoldModules?.length) {
    modules = [...config.scaffoldModules]
  }

  if (config.alignAdminApp) {
    const adminPath = path.isAbsolute(config.alignAdminApp)
      ? config.alignAdminApp
      : path.join(ROOT, appRel, config.alignAdminApp)
    if (!fs.existsSync(adminPath)) {
      throw new Error(`alignAdminApp không tồn tại: ${adminPath}`)
    }
    const adminConfig = readJson(adminPath)
    const fromAdmin = expandAdminModules(
      adminConfig.modules,
      config.adminModuleMap,
    )
    modules = [...new Set([...fromAdmin, ...modules])]
  }

  if (config.extraModules?.length) {
    modules = [...new Set([...modules, ...config.extraModules])]
  }

  const nativeModules = new Set([
    ...(config.native?.modules ?? []),
    ...(config.native?.services ?? []),
  ])

  return {
    config,
    modules: [...new Set(modules)],
    nativeModules,
    preserveControllers: new Set(config.native?.controllers ?? []),
    scaffoldControllers: config.scaffoldControllers !== false,
    scaffoldModuleFiles: config.scaffoldModuleFiles !== false,
  }
}

module.exports = {
  DEFAULT_ADMIN_MODULE_MAP,
  expandAdminModules,
  resolveApiModules,
}
