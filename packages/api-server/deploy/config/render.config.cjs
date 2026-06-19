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

/** Store modules — preset scaffold cho app mới, không dùng để nhận diện path runtime. */
const HUB_CHECKIN_EXCLUDED_STORE_MODULES = ['products', 'orders', 'promo-codes', 'carts']
const HUB_CHECKIN_EXCLUDED_STORE_ENTITIES = ['Product', 'Order', 'PromoCode', 'CustomerCart']

/** Infra check-in — preset scaffold; app thật khai báo trong api.app.config.json. */
const HUB_CHECKIN_API_INFRA = [
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
]

/** Store Sync — preset scaffold cho catalog / giỏ / checkout (+ auth stack). */
const STORE_SYNC_API_INFRA = [
  'socket',
  'auth',
  'notifications',
  'proxy-image',
  'dashboard',
  'system',
]

const HUB_CHECKIN_API_PRESET = {
  id: 'hub-checkin-api',
  alignAdminApp: '../hub-checkin-frontend/config/admin.app.config.json',
  extraModules: HUB_CHECKIN_API_INFRA,
  excludeModules: HUB_CHECKIN_EXCLUDED_STORE_MODULES,
  excludeEntities: HUB_CHECKIN_EXCLUDED_STORE_ENTITIES,
}

const APP_CONFIG_PRESETS = {
  'hub-checkin': HUB_CHECKIN_API_PRESET,
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
      'seo-metas',
      'users',
      'roles',
      'sessions',
      'accounts',
    ],
    extraModules: STORE_SYNC_API_INFRA,
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
  HUB_CHECKIN_EXCLUDED_STORE_MODULES,
  HUB_CHECKIN_EXCLUDED_STORE_ENTITIES,
  HUB_CHECKIN_API_INFRA,
  STORE_SYNC_API_INFRA,
  APP_CONFIG_PRESETS,
  expandAdminModules,
  resolveApiModules,
  presetForProductLine,
}
