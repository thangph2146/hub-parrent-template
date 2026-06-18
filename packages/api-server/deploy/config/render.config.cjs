/**
 * Resolve module render từ api.app.config.json (cấu hình trong app deploy).
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../cli/lib/monorepo-root.cjs')
const { listTemplateModuleIds, resolveTemplateRoot } = require('./template.config.cjs')

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
  events: ['events'],
  departments: ['departments'],
  'academic-years': ['academic-years'],
  courses: ['courses'],
  majors: ['majors'],
  'training-levels': ['training-levels'],
  'training-systems': ['training-systems'],
  products: ['products'],
  orders: ['orders'],
  'promo-codes': ['promo-codes'],
  'seo-metas': ['seo-metas'],
  'contact-requests': ['contact-requests'],
  'parent-students': ['parent-students'],
  'my-students': ['parent-students'],
}

/** Infra check-in — bổ sung ngoài admin menu. */
const HUB_EVENT_API_INFRA = [
  'public',
  'socket',
  'auth',
  'notifications',
  'contact-requests',
  'comments',
  'students',
  'admission-results',
  'proxy-image',
  'dashboard',
  'messages',
  'groups',
  'parent-students',
  'academic-years',
  'courses',
  'imported-users',
  'majors',
  'training-levels',
  'training-systems',
  'events',
  'departments',
  'event-registrations',
  'event-checkins',
  'event-checkouts',
  'face-data',
  'event-speakers',
  'seo-metas',
  'hanet',
  'products',
  'orders',
  'promo-codes',
  'carts',
]

/** Infra parent full site — ngoài admin map. */
const HUB_PARENT_API_INFRA = [
  'public',
  'socket',
  'auth',
  'notifications',
  'students',
  'admission-results',
  'proxy-image',
  'dashboard',
  'messages',
  'groups',
  'imported-users',
  'event-registrations',
  'event-checkins',
  'event-checkouts',
  'face-data',
  'event-speakers',
  'hanet',
  'carts',
]

/** Store Sync — catalog / giỏ / checkout (+ auth stack). */
const STORE_SYNC_API_INFRA = [
  'public',
  'socket',
  'auth',
  'notifications',
  'proxy-image',
  'dashboard',
  'system',
]

const APP_CONFIG_PRESETS = {
  'hub-event': {
    id: 'hub-checkin-api',
    alignAdminApp: '../hub-event-checkin-frontend/config/admin.app.config.json',
  },
  'hub-parent': {
    id: 'hub-parent-api',
    renderAllModules: true,
    alignAdminApp: '../../main/backend/admin.app.config.json',
  },
  'store-sync': {
    id: 'store-sync-api',
    modules: [
      'products',
      'orders',
      'promo-codes',
      'carts',
      'uploads',
      'categories',
      'settings',
      'users',
      'roles',
      'sessions',
      'accounts',
    ],
  },
  main: {
    id: 'main-api',
    description: 'Main API (source of truth). Không render vào apps/main/api.',
  },
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

function normalizeAppRel(appRel) {
  return appRel.replace(/\\/g, '/')
}

function isHubEventApi(appRel) {
  return normalizeAppRel(appRel).includes('apps/hub-event/api')
}

function isHubParentApi(appRel) {
  return normalizeAppRel(appRel).includes('apps/hub-parent/api')
}

function isStoreSyncApi(appRel) {
  return normalizeAppRel(appRel).includes('apps/store-sync/api')
}

function resolveApiModules(appRel) {
  const configPath = path.join(ROOT, appRel, 'api.app.config.json')
  if (!fs.existsSync(configPath)) {
    throw new Error(`Không tìm thấy api.app.config.json tại ${appRel}`)
  }
  const config = readJson(configPath)

  if (config.renderAllModules) {
    const templateRoot = resolveTemplateRoot()
    const modules = listTemplateModuleIds(templateRoot)
    return {
      config,
      modules,
      renderAllModules: true,
      disableEntityPrune: config.render?.pruneEntities === false,
      nativeModules: new Set(config.native?.modules ?? []),
      preserveControllers: new Set(config.native?.controllers ?? []),
      scaffoldControllers: config.scaffoldControllers !== false,
      scaffoldModuleFiles: config.scaffoldModuleFiles !== false,
    }
  }

  let modules = []
  if (config.modules?.length) modules = [...config.modules]
  else if (config.scaffoldModules?.length) modules = [...config.scaffoldModules]

  if (config.alignAdminApp) {
    const adminPath = path.isAbsolute(config.alignAdminApp)
      ? config.alignAdminApp
      : path.join(ROOT, appRel, config.alignAdminApp)
    if (!fs.existsSync(adminPath)) {
      if (config.alignAdminAppOptional && modules.length) {
        console.warn(`alignAdminApp không tồn tại, dùng modules khai báo sẵn: ${adminPath}`)
      } else {
        throw new Error(`alignAdminApp không tồn tại: ${adminPath}`)
      }
    } else {
      const adminConfig = readJson(adminPath)
      const fromAdmin = expandAdminModules(adminConfig.modules, config.adminModuleMap)
      modules = [...new Set([...fromAdmin, ...modules])]
    }
  }

  if (isHubEventApi(appRel)) {
    modules = [...new Set([...modules, ...HUB_EVENT_API_INFRA])]
  }

  if (isHubParentApi(appRel) && !config.renderAllModules) {
    modules = [...new Set([...modules, ...HUB_PARENT_API_INFRA])]
  }

  if (isStoreSyncApi(appRel)) {
    modules = [...new Set([...modules, ...STORE_SYNC_API_INFRA])]
  }

  if (config.extraModules?.length) {
    modules = [...new Set([...modules, ...config.extraModules])]
  }

  if (config.excludeModules?.length) {
    const excluded = new Set(config.excludeModules)
    modules = modules.filter((moduleId) => !excluded.has(moduleId))
  }

  return {
    config,
    modules: [...new Set(modules)],
    renderAllModules: false,
    disableEntityPrune: config.render?.pruneEntities === false,
    nativeModules: new Set(config.native?.modules ?? []),
    preserveControllers: new Set(config.native?.controllers ?? []),
    scaffoldControllers: config.scaffoldControllers !== false,
    scaffoldModuleFiles: config.scaffoldModuleFiles !== false,
  }
}

function presetForProductLine(line) {
  return APP_CONFIG_PRESETS[line] ?? null
}

module.exports = {
  DEFAULT_ADMIN_MODULE_MAP,
  HUB_EVENT_API_INFRA,
  HUB_PARENT_API_INFRA,
  STORE_SYNC_API_INFRA,
  APP_CONFIG_PRESETS,
  expandAdminModules,
  resolveApiModules,
  presetForProductLine,
  isHubEventApi,
  isHubParentApi,
  isStoreSyncApi,
}
