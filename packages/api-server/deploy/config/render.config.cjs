/**
 * Resolve module render từ api.app.config.json (cấu hình trong app deploy).
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../cli/lib/monorepo-root.cjs')
const { listTemplateModuleIds, resolveTemplateRoot } = require('./template.config.cjs')
const {
  PRODUCT_LINE_PROFILES,
  profileForApiApp,
} = require('./product-line-profiles.cjs')

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

function apiPresetFromProfile(profile) {
  return {
    id: `${profile.id}-api`,
    description: `${profile.label} API — generated from product-line profile`,
    modules: profile.api.modules ?? [],
    extraModules: profile.api.extraModules ?? [],
    excludeModules: profile.api.excludeModules ?? [],
    excludeEntities: profile.api.excludeEntities ?? [],
    alignAdminApp: profile.api.alignAdminApp,
    alignAdminAppOptional: profile.api.alignAdminAppOptional,
    packageModuleTemplates: { enabled: true },
    render: { pruneEntities: true },
  }
}

const APP_CONFIG_PRESETS = {
  'hub-checkin': apiPresetFromProfile(PRODUCT_LINE_PROFILES['hub-checkin']),
  'hub-parent': apiPresetFromProfile(PRODUCT_LINE_PROFILES['hub-parent']),
  'store-sync': apiPresetFromProfile(PRODUCT_LINE_PROFILES['store-sync']),
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
  const profile = profileForApiApp(appRel)
  const profileApi = profile?.api

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
  else if (profileApi?.modules?.length) modules = [...profileApi.modules]
  else if (config.scaffoldModules?.length) modules = [...config.scaffoldModules]

  const alignAdminApp = config.alignAdminApp ?? profileApi?.alignAdminApp
  const alignAdminAppOptional =
    config.alignAdminAppOptional ?? profileApi?.alignAdminAppOptional

  if (alignAdminApp) {
    const adminPath = path.isAbsolute(alignAdminApp)
      ? alignAdminApp
      : path.join(ROOT, appRel, alignAdminApp)
    if (!fs.existsSync(adminPath)) {
      if (alignAdminAppOptional && modules.length) {
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

  const extraModules = [
    ...(profileApi?.extraModules ?? []),
    ...(config.extraModules ?? []),
  ]
  if (extraModules.length) {
    modules = [...new Set([...modules, ...extraModules])]
  }

  const excludeModules = [
    ...(profileApi?.excludeModules ?? []),
    ...(config.excludeModules ?? []),
  ]
  if (excludeModules.length) {
    const excluded = new Set(excludeModules)
    modules = modules.filter((moduleId) => !excluded.has(moduleId))
  }

  return {
    config: {
      ...config,
      productLine: profile?.id ?? config.productLine,
      excludeEntities: [
        ...(profileApi?.excludeEntities ?? []),
        ...(config.excludeEntities ?? []),
      ],
    },
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
  PRODUCT_LINE_PROFILES,
  expandAdminModules,
  resolveApiModules,
  presetForProductLine,
}
