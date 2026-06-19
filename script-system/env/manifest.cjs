/**
 * Registry file .env theo product line / PM2 stack.
 * Mỗi app deployable có đúng một `.env.example` (commit) và `.env` (local, gitignore).
 *
 * @see docs/env/README.md
 */
const fs = require("node:fs")
const path = require("node:path")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

const ROOT = path.resolve(__dirname, "../..")

/** @typedef {{ path: string; package: string; template: string; port?: number }} EnvApp */

function envApp(lineKey, role, template) {
  const app = PRODUCT_LINES[lineKey]?.[role]
  if (!app) return []
  return [
    {
      path: app.path,
      package: app.package,
      template,
      port: app.port,
    },
  ]
}

/** @type {Record<string, { description: string; apps: EnvApp[] }>} */
const ENV_STACKS = {
  main: {
    description: "Source of truth — API + admin (@api + @backend)",
    apps: [
      ...envApp("main", "api", "api-main"),
      ...envApp("main", "backend", "next-admin"),
    ],
  },
  parent: {
    description: "Site chính — hub-parent API + main admin + storefront (ecosystem.main)",
    apps: [
      ...envApp("hub-parent", "api", "api-hub-parent"),
      ...envApp("main", "backend", "next-admin"),
      ...envApp("hub-parent", "frontend", "next-storefront-parent"),
    ],
  },
  checkin: {
    description: "Check-in sự kiện — hub-checkin API + check-in frontend (ecosystem.checkin)",
    apps: [
      ...envApp("hub-checkin", "api", "api-hub-checkin"),
      ...envApp("hub-checkin", "frontend", "next-checkin"),
    ],
  },
  store: {
    description: "Store sync — store-sync API + storefront (ecosystem store)",
    apps: [
      ...envApp("store-sync", "api", "api-store-sync"),
      ...envApp("store-sync", "frontend", "next-storefront-store"),
    ],
  },
}

function allEnvApps() {
  const seen = new Set()
  /** @type {EnvApp[]} */
  const out = []
  for (const stack of Object.values(ENV_STACKS)) {
    for (const app of stack.apps) {
      if (seen.has(app.path)) continue
      seen.add(app.path)
      out.push(app)
    }
  }
  return out
}

function loadRepoManifest() {
  const manifestPath = path.join(ROOT, "template.manifest.json")
  if (!fs.existsSync(manifestPath)) return null
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"))
}

function stackKeyForProductLine(productLine) {
  if (productLine === "hub-checkin") return "checkin"
  if (productLine === "hub-parent") return "parent"
  if (productLine === "store-sync") return "store"
  if (productLine === "main") return "main"
  return productLine ?? null
}

/**
 * Env apps thuộc repo hiện tại.
 * Downstream chỉ xử lý app đã tồn tại trong product line của repo để không tự tạo
 * apps/main, apps/hub-parent, apps/store-sync ngoài phạm vi.
 *
 * @param {string} [stackKey]
 * @returns {EnvApp[]}
 */
function envAppsForCurrentRepo(stackKey = "all") {
  const manifest = loadRepoManifest()
  const requested =
    stackKey === "all"
      ? allEnvApps()
      : (ENV_STACKS[stackKey]?.apps ?? [])

  if (manifest?.role !== "downstream") return requested

  const repoStackKey = stackKeyForProductLine(manifest.productLine)
  const allowedStackApps =
    repoStackKey && ENV_STACKS[repoStackKey]
      ? new Set(ENV_STACKS[repoStackKey].apps.map((app) => app.path))
      : null

  return requested.filter((app) => {
    if (allowedStackApps && !allowedStackApps.has(app.path)) return false
    return fs.existsSync(path.join(ROOT, app.path))
  })
}

/** Map apps/<line>/api → stack key (checkin, parent, …). */
function envStackForAppPath(appPathRel) {
  const normalized = appPathRel.replace(/\\/g, "/")
  for (const [stackKey, stack] of Object.entries(ENV_STACKS)) {
    for (const app of stack.apps) {
      if (app.path === normalized) return stackKey
    }
  }
  return null
}

module.exports = { ENV_STACKS, allEnvApps, envAppsForCurrentRepo, envStackForAppPath }
