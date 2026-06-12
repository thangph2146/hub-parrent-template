/**
 * ROUTE_SURFACE — ghép Admin Next URL + Nest controller + api-client HTTP paths.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { join, relative } from "node:path"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { ROOT: root } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

const MAIN_API = PRODUCT_LINES.main.api.path
const MAIN_BACKEND = PRODUCT_LINES.main.backend.path
const CHECKIN_API = PRODUCT_LINES["hub-event"].api.path
const CHECKIN_FRONT = PRODUCT_LINES["hub-event"].frontend.path
const API_CLIENT = "packages/api-client"

const ADMIN_TO_API_DOMAIN = {
  staff: "users",
  rbac: "roles",
  guides: "page-contents",
  "file-storage": "uploads",
  "my-students": "students",
  data: "system",
}

const API_TO_CLIENT_RESOURCE = {
  "page-contents": "guides",
  roles: "rbac",
}

function normPath(p) {
  return String(p).replace(/\\/g, "/")
}

function readJson(relPath) {
  const abs = join(root, relPath)
  if (!existsSync(abs)) return null
  try {
    return JSON.parse(readFileSync(abs, "utf8"))
  } catch {
    return null
  }
}

function escCell(s) {
  return String(s ?? "—").replace(/\|/g, "\\|")
}

/** @param {string} apiRoot */
function loadRouteConstants(apiRoot) {
  const constantsPath = join(root, apiRoot, "src/config/constants.ts")
  if (!existsSync(constantsPath)) return {}
  const content = readFileSync(constantsPath, "utf8")
  /** @type {Record<string, string>} */
  const map = {}
  for (const blockName of ["ADMIN_ROUTES", "PUBLIC_ROUTES"]) {
    const block = content.match(
      new RegExp(`export const ${blockName} = \\{([\\s\\S]*?)\\} as const`, "m")
    )
    if (!block) continue
    for (const m of block[1].matchAll(/(\w+):\s*['"]([^'"]+)['"]/g)) {
      map[`${blockName}.${m[1]}`] = m[2]
    }
  }
  return map
}

/**
 * @param {string} dir
 * @param {(rel: string) => void} onFile
 */
function walkSrcFiles(dir, onFile) {
  if (!existsSync(dir)) return
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, ent.name)
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist") continue
      walkSrcFiles(abs, onFile)
    } else if (/\.(tsx?|jsx?)$/.test(ent.name)) {
      onFile(normPath(relative(join(root), abs)))
    }
  }
}

/**
 * @param {string} apiRoot
 * @param {Record<string, string>} routeMap
 */
function scanApiControllers(apiRoot, routeMap) {
  /** @type {Map<string, { controller: string; base: string; methods: string[] }>} */
  const byDomain = new Map()

  walkSrcFiles(join(root, apiRoot, "src"), (rel) => {
    if (!rel.includes(`${apiRoot}/src/`) || !rel.endsWith(".controller.ts")) return
    const abs = join(root, rel)
    let content
    try {
      content = readFileSync(abs, "utf8")
    } catch {
      return
    }

    const ctrl = content.match(
      /@Controller\(\s*(ADMIN_ROUTES\.(\w+)|PUBLIC_ROUTES\.(\w+)|['"]([^'"]+)['"])\s*\)/
    )
    if (!ctrl) return

    let base = ""
    if (ctrl[2]) base = routeMap[`ADMIN_ROUTES.${ctrl[2]}`] ?? ""
    else if (ctrl[3]) base = routeMap[`PUBLIC_ROUTES.${ctrl[3]}`] ?? ""
    else base = ctrl[4] ?? ""

    const domain = rel
      .replace(`${apiRoot}/src/`, "")
      .split("/")[0]

    const methods = []
    for (const m of content.matchAll(
      /@(Get|Post|Put|Patch|Delete)\(\s*(?:['"]([^'"]*)['"])?\s*\)/g
    )) {
      const suffix = m[2] ?? ""
      const path = suffix ? `${base}/${suffix}`.replace(/\/+/g, "/") : base
      methods.push(`${m[1].toUpperCase()} /${path}`)
    }

    const key = domain
    const row = byDomain.get(key) ?? {
      controller: rel.replace(`${apiRoot}/`, ""),
      base,
      methods: [],
    }
    if (!row.base && base) row.base = base
    row.methods.push(...methods)
    byDomain.set(key, row)
  })

  for (const row of byDomain.values()) {
    row.methods = [...new Set(row.methods)].sort()
  }
  return byDomain
}

/** @param {string} resourceRel */
function scanApiClientPaths(resourceRel) {
  const abs = join(root, resourceRel)
  if (!existsSync(abs)) return []
  const content = readFileSync(abs, "utf8")
  const paths = new Set()
  for (const m of content.matchAll(
    /[`'"](\/(?:admin|public|auth|parent|uploads)[^`'"]*)[`'"]/g
  )) {
    paths.add(m[1])
  }
  return [...paths].sort()
}

function apiDomainForAdminModule(moduleId) {
  return ADMIN_TO_API_DOMAIN[moduleId] ?? moduleId
}

function clientResourceForApiDomain(apiDomain) {
  const mapped = API_TO_CLIENT_RESOURCE[apiDomain] ?? apiDomain
  const rel = `${API_CLIENT}/src/resources/${mapped}.ts`
  return existsSync(join(root, rel)) ? rel : null
}

function adminNextBase(moduleId) {
  return `/${moduleId}`
}

function loadAdminModules(backendRoot) {
  const cfg = readJson(`${backendRoot}/admin.app.config.json`)
  return Array.isArray(cfg?.modules) ? cfg.modules : []
}

function formatMethodSample(methods, limit = 4) {
  if (!methods?.length) return "—"
  const sample = methods.slice(0, limit).join("; ")
  return methods.length > limit ? `${sample}; …+${methods.length - limit}` : sample
}

export function writeRouteSurfaceMd() {
  const mdDir = join(root, ".graphify", "markdown")
  const generatedAt = new Date().toISOString()
  const mainRoutes = loadRouteConstants(MAIN_API)
  const mainControllers = scanApiControllers(MAIN_API, mainRoutes)
  const mainModules = loadAdminModules(MAIN_BACKEND)
  const checkinModules = loadAdminModules(CHECKIN_FRONT)

  const lines = [
    "# ROUTE_SURFACE — Admin URL ↔ API ↔ api-client (Graphify)",
    "",
    `> **Sinh tự động:** \`${generatedAt}\` — ghép \`admin.app.config.json\`, Nest \`@Controller\`, \`packages/api-client/src/resources/*.ts\`.`,
    "",
    "Lưu ý: Next App Router còn route theo **file convention** (`src/app/**/page.tsx`); bảng dưới lấy **module id** từ config admin. Chi tiết file: `apps/*/backend/.graphify/markdown/ENTRY_POINTS.md`.",
    "",
    "## Main admin modules (`apps/main/backend`)",
    "",
    "| Module | Admin URL (base) | API domain | API prefix (Nest) | api-client | HTTP mẫu (client) |",
    "|--------|------------------|------------|-------------------|------------|-------------------|",
  ]

  for (const moduleId of mainModules) {
    const apiDomain = apiDomainForAdminModule(moduleId)
    const ctrl = mainControllers.get(apiDomain)
    const clientRel = clientResourceForApiDomain(apiDomain)
    const clientPaths = clientRel ? scanApiClientPaths(clientRel) : []
    const routeKey = `ADMIN_ROUTES.${apiDomain.replace(/-/g, "_").toUpperCase()}`
    const apiPrefix = ctrl?.base
      ? `/${ctrl.base}`
      : mainRoutes[routeKey]
        ? `/${mainRoutes[routeKey]}`
        : "—"

    lines.push(
      `| \`${escCell(moduleId)}\` | \`${escCell(adminNextBase(moduleId))}\` | \`${escCell(apiDomain)}\` | \`${escCell(apiPrefix)}\` | \`${escCell(clientRel?.replace(`${API_CLIENT}/src/resources/`, "") ?? "—")}\` | ${escCell(formatMethodSample(clientPaths))} |`
    )
  }

  lines.push("")
  lines.push("## API domain không có module admin riêng (main API)")
  lines.push("")
  lines.push(
    "Các domain có controller nhưng **không** nằm trong `admin.app.config.json` modules (webhook, public-only, v.v.):"
  )
  lines.push("")
  lines.push("| Domain | Controller | HTTP (Nest, rút gọn) |")
  lines.push("|--------|------------|----------------------|")

  const moduleApiDomains = new Set(
    mainModules.map((m) => apiDomainForAdminModule(m))
  )
  for (const [domain, row] of [...mainControllers.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    if (moduleApiDomains.has(domain)) continue
    lines.push(
      `| \`${escCell(domain)}\` | \`${escCell(row.controller)}\` | ${escCell(formatMethodSample(row.methods, 6))} |`
    )
  }

  lines.push("")
  lines.push("## Check-in admin modules (`hub-event-checkin-frontend`)")
  lines.push("")
  if (checkinModules.length) {
    lines.push("| Module | Admin URL | Có trên main API |")
    lines.push("|--------|-----------|------------------|")
    for (const moduleId of checkinModules) {
      const apiDomain = apiDomainForAdminModule(moduleId)
      const onMain = mainControllers.has(apiDomain) ? "✓" : "—"
      lines.push(
        `| \`${escCell(moduleId)}\` | \`${escCell(adminNextBase(moduleId))}\` | ${onMain} |`
      )
    }
  } else {
    lines.push("- (không đọc được `admin.app.config.json` check-in)")
  }

  lines.push("")
  lines.push("## PUBLIC_ROUTES (main API — tham chiếu nhanh)")
  lines.push("")
  for (const [key, path] of Object.entries(mainRoutes).sort((a, b) =>
    a[1].localeCompare(b[1])
  )) {
    if (!key.startsWith("PUBLIC_ROUTES.")) continue
    lines.push(`- \`${path}\` — \`${key.replace("PUBLIC_ROUTES.", "")}\``)
  }

  lines.push("")
  lines.push("## Gợi ý agent")
  lines.push("")
  lines.push(
    "1. Đổi **admin page** → `packages/admin-app` + `pnpm admin:generate:main` (hoặc check-in)."
  )
  lines.push(
    "2. Đổi **HTTP contract** → `apps/main/api` controller + `packages/api-client` resource tương ứng."
  )
  lines.push(
    "3. Check-in deploy → `SYNC_DELTA.md` + `pnpm pull:checkin` sau khi sửa main API."
  )
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push("- `pnpm graphify:ai-summary`")
  lines.push("")

  const outPath = join(mdDir, "ROUTE_SURFACE.md")
  writeFileSync(outPath, lines.join("\n"), "utf8")
  console.log(`[graphify-route-surface] Đã ghi ${outPath}`)
}
