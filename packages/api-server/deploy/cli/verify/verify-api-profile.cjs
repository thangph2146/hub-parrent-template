/**
 * Verify product-line profile parity for rendered apps.
 *
 * Usage: node packages/api-server/deploy/cli/verify/verify-api-profile.cjs hub-parent
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const {
  PRODUCT_LINE_PROFILES,
  getProductLineProfile,
} = require("../../config/product-line-profiles.cjs")
const {
  DEFAULT_ADMIN_MODULE_MAP,
} = require("../../config/render.config.cjs")

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, "utf8"))
}

function readJsonIfExists(absPath) {
  return fs.existsSync(absPath) ? readJson(absPath) : null
}

function norm(rel) {
  return rel.replace(/\\/g, "/")
}

function diffMissing(expected, actual) {
  const actualSet = new Set(actual)
  return expected.filter((item) => !actualSet.has(item))
}

function uniq(items) {
  return [...new Set(items.filter(Boolean))]
}

function formatList(items, limit = 18) {
  const values = uniq(items)
  if (!values.length) return "none"
  if (values.length <= limit) return values.join(", ")
  return `${values.slice(0, limit).join(", ")} … +${values.length - limit}`
}

function formatDiff(label, expected, actual) {
  const missing = diffMissing(expected ?? [], actual ?? [])
  const extra = diffMissing(actual ?? [], expected ?? [])
  const parts = []
  if (missing.length) parts.push(`thiếu ${label}: ${formatList(missing)}`)
  if (extra.length) parts.push(`dư ${label}: ${formatList(extra)}`)
  return parts.length ? parts.join(" · ") : `${label}: khớp`
}

function permissionResourcesFromActiveFile(absPath) {
  if (!fs.existsSync(absPath)) return null
  const content = fs.readFileSync(absPath, "utf8")
  const match = content.match(/ACTIVE_PERMISSION_RESOURCES\s*=\s*(\[[\s\S]*?\])\s+as const/)
  if (!match) return null
  return JSON.parse(match[1])
}

function constArrayFromActiveFile(absPath, name) {
  if (!fs.existsSync(absPath)) return null
  const content = fs.readFileSync(absPath, "utf8")
  const match = content.match(new RegExp(`${name}\\s*=\\s*(\\[[\\s\\S]*?\\])\\s+as const`))
  if (!match) return null
  return JSON.parse(match[1])
}

function permissionResourceFromPrefix(prefix) {
  return String(prefix)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
}

function collectMenuHrefs(node, out = []) {
  if (!node) return out
  if (Array.isArray(node)) {
    for (const item of node) collectMenuHrefs(item, out)
    return out
  }
  if (typeof node !== "object") return out
  const href = node.href ?? node.path
  if (typeof href === "string") out.push(href)
  for (const key of ["items", "children", "groups", "menu"]) {
    collectMenuHrefs(node[key], out)
  }
  return out
}

function walkFiles(absPath, predicate, out = []) {
  if (!fs.existsSync(absPath)) return out
  const stat = fs.statSync(absPath)
  if (stat.isFile()) {
    if (predicate(absPath)) out.push(absPath)
    return out
  }
  if (!stat.isDirectory()) return out
  for (const entry of fs.readdirSync(absPath, { withFileTypes: true })) {
    if (["node_modules", ".next", "dist"].includes(entry.name)) continue
    walkFiles(path.join(absPath, entry.name), predicate, out)
  }
  return out
}

function collectApiControllers(apiPath) {
  const srcRoot = path.join(apiPath, "src")
  return walkFiles(srcRoot, (file) => file.endsWith(".controller.ts"))
    .map((file) => norm(path.relative(srcRoot, file)))
    .filter((rel) => !rel.startsWith("common/"))
    .sort()
}

function collectRouteFiles(routeRoot) {
  return walkFiles(
    routeRoot,
    (file) => ["page.tsx", "loading.tsx"].includes(path.basename(file)),
  ).map((file) => norm(path.relative(routeRoot, file))).sort()
}

function routeRootForAdminConfig(profile, config) {
  const configDir = path.dirname(path.join(ROOT, profile.admin.configPath))
  const appRoot = path.basename(configDir) === "config" ? path.dirname(configDir) : configDir
  const basePath = config.basePath ?? ""
  if (!basePath || basePath === "/") return path.join(appRoot, "src/app")
  return path.join(appRoot, "src/app", basePath.replace(/^\//, ""))
}

function isGeneratedRouteTree(absPath) {
  if (!fs.existsSync(absPath)) return false
  const stat = fs.statSync(absPath)
  if (stat.isFile()) {
    const name = path.basename(absPath)
    if (name !== "page.tsx" && name !== "loading.tsx") return false
    return fs.readFileSync(absPath, "utf8").includes("AUTO-GENERATED")
  }
  if (!stat.isDirectory()) return false
  const entries = fs.readdirSync(absPath)
  if (!entries.length) return true
  return entries.every((entry) => isGeneratedRouteTree(path.join(absPath, entry)))
}

function verifyAdminConfig(profile, errors) {
  const adminConfigPath = path.join(ROOT, profile.admin.configPath)
  if (!fs.existsSync(adminConfigPath)) {
    return
  }
  const config = readJson(adminConfigPath)
  const missing = diffMissing(profile.admin.modules ?? [], config.modules ?? [])
  if (missing.length) {
    errors.push(`admin config thiếu module profile: ${missing.join(", ")}`)
  }
  const extraModules = (config.modules ?? []).filter(
    (moduleId) => !(profile.admin.modules ?? []).includes(moduleId),
  )
  if (extraModules.length) {
    errors.push(`admin config có module ngoài profile: ${extraModules.join(", ")}`)
  }

  const adminModuleMap = {
    ...DEFAULT_ADMIN_MODULE_MAP,
    ...(profile.admin?.adminModuleMap ?? {}),
  }
  const apiModules = new Set(profile.api.modules ?? [])
  const excludedApiModules = new Set(profile.api.excludeModules ?? [])
  for (const moduleId of config.modules ?? []) {
    const deps = adminModuleMap[moduleId] ?? [moduleId]
    for (const dep of Array.isArray(deps) ? deps : [deps]) {
      if (!apiModules.has(dep) || excludedApiModules.has(dep)) {
        errors.push(`admin module ${moduleId} cần API module bị thiếu/loại: ${dep}`)
      }
    }
  }

  const permissionResources = new Set(profile.permissions.resources ?? [])
  for (const [moduleId, prefix] of Object.entries(config.pageGuardPermissionPrefix ?? {})) {
    const resource = permissionResourceFromPrefix(prefix)
    if (!permissionResources.has(resource)) {
      errors.push(`pageGuard ${moduleId} trỏ permission resource ngoài profile: ${resource}`)
    }
  }

  const excluded = new Set(profile.admin.excludeHrefs ?? [])
  for (const href of collectMenuHrefs(config.menu)) {
    if (excluded.has(href)) {
      errors.push(`admin menu còn href bị loại bởi profile: ${href}`)
    }
  }

  const routeRoot = routeRootForAdminConfig(profile, config)
  const keepDirs = new Set(config.modules ?? [])
  const dashboardDir = config.dashboard?.relativePath?.replace(/\/page\.tsx$/, "")
  if (dashboardDir) keepDirs.add(dashboardDir.split(/[\\/]/)[0])
  for (const file of config.native?.files ?? []) {
    const [top] = file.split("/")
    if (top && top !== "page.tsx") keepDirs.add(top)
  }
  if (fs.existsSync(routeRoot)) {
    for (const entry of fs.readdirSync(routeRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || keepDirs.has(entry.name)) continue
      const modDir = path.join(routeRoot, entry.name)
      if (isGeneratedRouteTree(modDir)) {
        errors.push(`admin route generated stale ngoài config: ${path.relative(ROOT, modDir)}`)
      }
    }
  }
}

function logProductAudit(productKey, profile, context) {
  const {
    apiConfig,
    adminConfig,
    activeResources,
    activeRolePresets,
    apiPath,
  } = context
  const adminModules = adminConfig?.modules ?? []
  const apiModules = apiConfig?.modules ?? []
  const menuHrefs = uniq([
    ...collectMenuHrefs(adminConfig?.menu),
    ...(adminConfig?.menu?.alwaysIncludeHrefs ?? []),
    ...(profile.admin.alwaysIncludeHrefs ?? []),
  ])
  const excludedHrefs = uniq([
    ...(adminConfig?.menu?.excludeHrefs ?? []),
    ...(profile.admin.excludeHrefs ?? []),
  ])
  const pageGuards = Object.entries(adminConfig?.pageGuardPermissionPrefix ?? {})
    .map(([moduleId, prefix]) => `${moduleId}:${prefix}`)
  const controllers = collectApiControllers(apiPath)
  const routeRoot = adminConfig ? routeRootForAdminConfig(profile, adminConfig) : null
  const routeFiles = routeRoot ? collectRouteFiles(routeRoot) : []

  console.log(`\n[product:audit] ${productKey} — ${profile.label}`)
  console.log(
    `[product:audit] 1. feature target: target=${profile.targets?.appRoot ?? profile.appsPath}; owner=${profile.ownership?.apps ?? "downstream"}; packages=${formatList(profile.packages?.required ?? [])}`,
  )
  console.log(
    `[product:audit]    admin modules (${adminModules.length}): ${formatList(adminModules)}`,
  )
  console.log(
    `[product:audit]    api modules (${apiModules.length}): ${formatList(apiModules)}`,
  )
  console.log(
    `[product:audit]    ${formatDiff("admin modules", profile.admin.modules ?? [], adminModules)}`,
  )
  console.log(
    `[product:audit]    ${formatDiff("api modules", profile.api.modules ?? [], apiModules)}`,
  )
  console.log(
    `[product:audit] 2. permissions: resources=${activeResources?.length ?? 0}; roles=${formatList(activeRolePresets ?? [])}`,
  )
  console.log(
    `[product:audit]    ${formatDiff("permission resources", profile.permissions.resources ?? [], activeResources ?? [])}`,
  )
  console.log(
    `[product:audit]    ${formatDiff("role presets", profile.permissions.rolePresets ?? [], activeRolePresets ?? [])}`,
  )
  console.log(
    `[product:audit] 3. api: controllers=${controllers.length}; excludeModules=${formatList(profile.api.excludeModules ?? [])}`,
  )
  console.log(`[product:audit]    controllers: ${formatList(controllers, 14)}`)
  console.log(
    `[product:audit] 4. ui actions: routes=${routeFiles.length}; menu=${formatList(menuHrefs)}; exclude=${formatList(excludedHrefs)}; pageGuards=${formatList(pageGuards, 14)}`,
  )
  console.log(`[product:audit]    routes: ${formatList(routeFiles, 14)}\n`)
}

function verify(productKey) {
  const profile = getProductLineProfile(productKey)
  const apiPath = path.join(ROOT, profile.api.appPath)
  const errors = []
  const configPath = path.join(apiPath, "api.app.config.json")
  const apiConfig = readJsonIfExists(configPath)
  const adminConfigPath = path.join(ROOT, profile.admin.configPath)
  const adminConfig = readJsonIfExists(adminConfigPath)
  const activePermissionsPath = path.join(apiPath, "src/config/active-permissions.ts")
  const activeResources = permissionResourcesFromActiveFile(activePermissionsPath)
  const activeRolePresets = constArrayFromActiveFile(activePermissionsPath, "ACTIVE_ROLE_PRESETS")

  if (!fs.existsSync(apiPath)) {
    errors.push(`thiếu API app: ${profile.api.appPath}`)
  }

  if (!apiConfig) {
    errors.push(`thiếu ${norm(path.relative(ROOT, configPath))}`)
  } else {
    if ((apiConfig.productLine ?? productKey) !== productKey) {
      errors.push(`api.app.config.json productLine không khớp: ${apiConfig.productLine}`)
    }
    const missingModules = diffMissing(profile.api.modules ?? [], apiConfig.modules ?? [])
    if (missingModules.length) {
      errors.push(`api.app.config.json thiếu module profile: ${missingModules.join(", ")}`)
    }
    const excluded = new Set([...(profile.api.excludeModules ?? []), ...(apiConfig.excludeModules ?? [])])
    const conflicting = (apiConfig.modules ?? []).filter((moduleId) => excluded.has(moduleId))
    if (conflicting.length) {
      errors.push(`api.app.config.json vừa include vừa exclude module: ${conflicting.join(", ")}`)
    }
  }

  if (!activeResources) {
    errors.push("thiếu hoặc không parse được src/config/active-permissions.ts")
  } else {
    const missingResources = diffMissing(profile.permissions.resources ?? [], activeResources)
    if (missingResources.length) {
      errors.push(`active-permissions thiếu resource profile: ${missingResources.join(", ")}`)
    }
    const extraResources = diffMissing(activeResources, profile.permissions.resources ?? [])
    if (extraResources.length) {
      errors.push(`active-permissions có resource ngoài profile: ${extraResources.join(", ")}`)
    }
  }

  if (activeRolePresets) {
    const extraRolePresets = diffMissing(activeRolePresets, profile.permissions.rolePresets ?? [])
    if (extraRolePresets.length) {
      errors.push(`active role preset ngoài profile: ${extraRolePresets.join(", ")}`)
    }
  }

  verifyAdminConfig(profile, errors)
  logProductAudit(productKey, profile, {
    apiConfig,
    adminConfig,
    activeResources,
    activeRolePresets,
    apiPath,
  })

  if (errors.length) {
    console.error(`[verify-api-profile] FAIL ${productKey}:`)
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(`[verify-api-profile] OK — ${productKey} khớp product-line profile.`)
}

const arg = process.argv[2] ?? "hub-parent"
if (!PRODUCT_LINE_PROFILES[arg]) {
  console.error(
    `Usage: node deploy/cli/verify/verify-api-profile.cjs <${Object.keys(PRODUCT_LINE_PROFILES).join("|")}>`,
  )
  process.exit(1)
}
verify(arg)
