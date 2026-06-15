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
const { ROOT: root } = require("../lib/monorepo-root.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")
const { readAdminAppConfig } = require("../lib/admin-app-config-path.cjs")

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

const CONTROLLER_DECORATOR_RE =
  /@Controller\(\s*(ADMIN_ROUTES\.(\w+)|PUBLIC_ROUTES\.(\w+)|['"]([^'"]+)['"]|`\$\{PUBLIC_ROUTES\.(\w+)\}([^`]*)`)\s*\)/g

/** @param {RegExpMatchArray} match @param {Record<string, string>} routeMap */
function resolveControllerBase(match, routeMap) {
  if (match[2]) return routeMap[`ADMIN_ROUTES.${match[2]}`] ?? ""
  if (match[3]) return routeMap[`PUBLIC_ROUTES.${match[3]}`] ?? ""
  if (match[4]) return match[4]
  if (match[5]) {
    return `${routeMap[`PUBLIC_ROUTES.${match[5]}`] ?? ""}${match[6] ?? ""}`.replace(
      /\/+/g,
      "/"
    )
  }
  return ""
}

/** @param {string} content @param {Record<string, string>} routeMap */
function resolveAllControllerSegments(content, routeMap) {
  const matches = [...content.matchAll(CONTROLLER_DECORATOR_RE)]
  if (!matches.length) return []
  return matches
    .map((m, i) => {
      const start = m.index ?? 0
      const nextStart = matches[i + 1]?.index ?? content.length
      return {
        base: resolveControllerBase(m, routeMap),
        segment: content.slice(start, nextStart),
      }
    })
    .filter((s) => s.base)
}

function resolveControllerDecorator(content, routeMap) {
  const first = resolveAllControllerSegments(content, routeMap)[0]
  return first ? { base: first.base } : null
}

/** @param {string} mod */
export function listPackageModuleControllerPaths(mod) {
  const modDir = join(root, "packages/api-server/src/modules", mod)
  if (!existsSync(modDir)) return []
  return readdirSync(modDir)
    .filter(
      (f) =>
        f.endsWith(".controller.ts") &&
        !f.includes(".spec.") &&
        !f.startsWith("public-"),
    )
    .map((f) => join(modDir, f))
}

/** Controller mỏng extend @workspace/api-server — route trên Base*Controller. */
function resolvePackageController(appContent) {
  const pkgImport = appContent.match(
    /from\s+['"]@workspace\/api-server\/modules\/([^'"]+)['"]/,
  )
  if (
    !pkgImport ||
    !/extends\s+(Base|Package)\w+Controller/.test(appContent)
  ) {
    return null
  }
  const mod = pkgImport[1]
  const candidates = listPackageModuleControllerPaths(mod)
  if (!candidates.length) return null

  const preferred = join(
    root,
    "packages/api-server/src/modules",
    mod,
    `${mod}.controller.ts`,
  )
  let pkgCtrl =
    candidates.find((p) => p === preferred) ?? candidates[0]
  for (const p of candidates) {
    const src = readFileSync(p, "utf8")
    if (/export class Base\w+Controller/.test(src)) {
      pkgCtrl = p
      break
    }
  }

  return {
    mod,
    rel: normPath(relative(root, pkgCtrl)),
    content: readFileSync(pkgCtrl, "utf8"),
  }
}

const BASE_CRUD_CONTROLLER_SRC = join(
  root,
  "packages/api-server/src/bases/base-crud.controller.ts",
)
const BASE_ADMIN_CRUD_CONTROLLER_SRC = join(
  root,
  "packages/api-server/src/bases/base-admin-crud.controller.ts",
)

function extractHttpMethods(content, base) {
  const methods = []
  for (const m of content.matchAll(
    /@(Get|Post|Put|Patch|Delete)\(\s*(?:['"]([^'"]*)['"])?\s*\)/g,
  )) {
    const suffix = m[2] ?? ""
    const path = suffix ? `${base}/${suffix}`.replace(/\/+/g, "/") : base
    methods.push(`${m[1].toUpperCase()} /${path}`)
  }
  return [...new Set(methods)].sort()
}

/** Route kế thừa từ BaseCrudController / BaseAdminCrudController (không lặp trên subclass). */
function mergeInheritedHttpMethods(content, base, methods) {
  let merged = [...methods]
  if (/extends BaseCrudController/.test(content) && existsSync(BASE_CRUD_CONTROLLER_SRC)) {
    merged.push(
      ...extractHttpMethods(readFileSync(BASE_CRUD_CONTROLLER_SRC, "utf8"), base),
    )
  }
  if (
    /extends BaseAdminCrudController/.test(content) &&
    existsSync(BASE_ADMIN_CRUD_CONTROLLER_SRC)
  ) {
    merged.push(
      ...extractHttpMethods(
        readFileSync(BASE_ADMIN_CRUD_CONTROLLER_SRC, "utf8"),
        base,
      ),
    )
  }
  return [...new Set(merged)].sort()
}

/**
 * @param {string} apiRoot
 * @param {Record<string, string>} routeMap
 * @param {{ packageRouteMap?: Record<string, string> }} [options]
 */
export function scanApiControllers(apiRoot, routeMap, options = {}) {
  const packageRouteMap =
    options.packageRouteMap ?? loadRouteConstants("packages/api-server")
  /** @type {Map<string, { controller: string; base: string; methods: string[]; viaPackage?: string }>} */
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

    const domain = rel.replace(`${apiRoot}/src/`, "").split("/")[0]
    let scanContent = content
    let controllerLabel = rel.replace(`${apiRoot}/`, "")
    let viaPackage

    let segments = resolveAllControllerSegments(content, routeMap)
    if (!segments.length) {
      const pkg = resolvePackageController(content)
      if (!pkg) return
      scanContent = pkg.content
      viaPackage = pkg.mod
      controllerLabel = `${controllerLabel} → ${pkg.rel.replace("packages/api-server/", "")}`
      segments = resolveAllControllerSegments(scanContent, packageRouteMap)
      if (!segments.length) return
    }

    for (const { base, segment } of segments) {
      const segmentSrc = segment === content ? scanContent : segment
      let methods = extractHttpMethods(segmentSrc, base)
      if (viaPackage) {
        methods = mergeInheritedHttpMethods(scanContent, base, methods)
      }
      const key = domain
      const row = byDomain.get(key) ?? {
        controller: controllerLabel,
        base,
        bases: [],
        methods: [],
        viaPackage,
      }
      if (!row.bases.includes(base)) row.bases.push(base)
      if (!row.base) row.base = base
      if (viaPackage) row.viaPackage = viaPackage
      if (segments.length > 1 && !row.controller.includes("(multi)")) {
        row.controller = `${controllerLabel} (multi @Controller)`
      }
      row.methods.push(...methods)
      byDomain.set(key, row)
    }
  })

  for (const row of byDomain.values()) {
    row.methods = [...new Set(row.methods)].sort()
    if (row.bases?.length > 1) {
      row.base = row.bases
        .map((b) => (b.startsWith("/") ? b : `/${b}`))
        .join(", ")
    }
    delete row.bases
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

function loadAdminModules(appRel) {
  const cfg = readAdminAppConfig(join(root, appRel))
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
    "3. Check-in deploy → `SYNC_DELTA.md` + `pnpm pull:checkin` sau khi sửa `@workspace/api-server` hoặc registry."
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

/**
 * @param {string} apiRoot
 * @param {{
 *   title: string
 *   intro?: string
 *   verifyLine?: string
 *   refreshCmd?: string
 *   monorepoLinks?: string[]
 * }} meta
 */
export function writeApiEndpointsMd(apiRoot, meta) {
  const generatedAt = new Date().toISOString()
  const routeMap = loadRouteConstants(apiRoot)
  const packageRouteMap = loadRouteConstants("packages/api-server")
  const controllers = scanApiControllers(apiRoot, routeMap, { packageRouteMap })
  const globalPrefix = "api"

  const outDir = join(root, apiRoot, ".graphify/markdown")
  const lines = [
    `# ${meta.title}`,
    "",
    `> **Sinh tự động:** \`${generatedAt}\` — quét \`src/**/*.controller.ts\` + route từ \`Base*Controller\` / \`BaseCrudController\` trong \`@workspace/api-server\` khi app extend mỏng.`,
    "",
  ]
  if (meta.intro) {
    lines.push(meta.intro, "")
  }
  lines.push(
    "## Global prefix",
    "",
    `- Nest \`setGlobalPrefix('${globalPrefix}')\` → URL thực tế: \`/${globalPrefix}/<path-dưới>\``,
    "- Ví dụ: `GET /admin/users` trong bảng = **`GET /api/admin/users`** trên wire.",
    "",
    "Nguồn route constants: [`src/config/constants.ts`](../../src/config/constants.ts) (`ADMIN_ROUTES`, `PUBLIC_ROUTES`).",
    "",
  )
  if (meta.verifyLine) {
    lines.push(meta.verifyLine, "")
  }
  lines.push(
    "## Prefix admin (`ADMIN_ROUTES`)",
    "",
    "| Key | Path (không gồm `/api`) |",
    "|-----|------------------------|",
  )

  for (const [key, path] of Object.entries(routeMap).sort((a, b) =>
    a[1].localeCompare(b[1])
  )) {
    if (!key.startsWith("ADMIN_ROUTES.")) continue
    lines.push(`| \`${key.replace("ADMIN_ROUTES.", "")}\` | \`/${path}\` |`)
  }

  lines.push("")
  lines.push("## Prefix public & khác (`PUBLIC_ROUTES` + uploads)",
    "",
    "| Key | Path |",
    "|-----|------|",
  )
  for (const [key, path] of Object.entries(routeMap).sort((a, b) =>
    a[1].localeCompare(b[1])
  )) {
    if (!key.startsWith("PUBLIC_ROUTES.")) continue
    lines.push(`| \`${key.replace("PUBLIC_ROUTES.", "")}\` | \`/${path}\` |`)
  }

  lines.push("")
  lines.push("## Endpoint theo domain (Nest controller)",
    "",
    "Cột **Package** = HTTP khai báo trên `packages/api-server` (app chỉ extend).",
    "",
  )

  for (const [domain, row] of [...controllers.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    lines.push(`### \`${domain}\``)
    lines.push("")
    lines.push(`- **Controller:** \`${row.controller}\``)
    const baseLabel = row.base.startsWith("/") ? row.base : `/${row.base}`
    lines.push(`- **Base:** \`${baseLabel}\``)
    if (row.viaPackage) {
      lines.push(
        `- **Package:** \`@workspace/api-server/modules/${row.viaPackage}\` (unified — không duplicate route trong app)`,
      )
    }
    lines.push("")
    if (!row.methods.length) {
      lines.push("_Không trích được `@Get`/`@Post` — kiểm tra decorator._")
      lines.push("")
      continue
    }
    lines.push("| Method | Path (relative, chưa `/api`) | Full URL mẫu |")
    lines.push("|--------|------------------------------|--------------|")
    for (const methodLine of row.methods) {
      const m = methodLine.match(/^(GET|POST|PUT|PATCH|DELETE)\s+\/(.+)$/)
      if (!m) continue
      const full = `/${globalPrefix}/${m[2]}`.replace(/\/+/g, "/")
      lines.push(`| \`${m[1]}\` | \`/${m[2]}\` | \`${full}\` |`)
    }
    lines.push("")
  }

  lines.push("## Liên kết")
  lines.push("")
  for (const link of meta.monorepoLinks ?? [
    "- Monorepo: [ROUTE_SURFACE.md](../../../../.graphify/markdown/ROUTE_SURFACE.md) (admin ↔ api-client)",
    "- [`../README.md`](../README.md) · [`SUMMARY_FOR_AI.md`](SUMMARY_FOR_AI.md)",
  ]) {
    lines.push(link)
  }
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push("```bash")
  lines.push(meta.refreshCmd ?? `node script-system/graphify/graphify-update.cjs ${apiRoot}`)
  lines.push("pnpm graphify:ai-summary")
  lines.push("```")
  lines.push("")

  const outPath = join(outDir, "API_ENDPOINTS.md")
  writeFileSync(outPath, lines.join("\n"), "utf8")
  console.log(`[graphify-route-surface] Đã ghi ${outPath} (${controllers.size} domain)`)
}

/** Bản đồ endpoint đầy đủ cho `apps/main/api` (Graphify local). */
export function writeMainApiEndpointsMd() {
  writeApiEndpointsMd(MAIN_API, {
    title: "API endpoints — @api (`apps/main/api`)",
    verifyLine:
      "Verify contract: `pnpm verify:api-contract` · parity package: `pnpm verify:main-api-endpoint-parity`.",
    refreshCmd: "node script-system/graphify/graphify-update.cjs apps/main/api",
  })
}

/** Bản đồ endpoint deploy line check-in (`apps/hub-event/api`). */
export function writeCheckinApiEndpointsMd() {
  writeApiEndpointsMd(CHECKIN_API, {
    title: "API endpoints — @hub-event/api (`apps/hub-event/api`)",
    intro:
      "Deploy line check-in — controller/service AUTO-GENERATED từ `@workspace/api-server` + `api.app.config.json`. Native giữ tay: `public.controller.ts`, `system.module.ts`, `public-uploads.controller.ts`. Render: `pnpm api:render:checkin`.",
    verifyLine:
      "Verify: `pnpm verify:checkin-api` · `pnpm verify:main-api-endpoint-parity` (28 module vs `apps/main/api`) · `pnpm verify:api-contract`.",
    refreshCmd:
      "pnpm api:render:checkin && node script-system/graphify/graphify-update.cjs apps/hub-event/api",
    monorepoLinks: [
      "- Main dev API: [`../../main/api/.graphify/markdown/API_ENDPOINTS.md`](../../main/api/.graphify/markdown/API_ENDPOINTS.md)",
      "- Monorepo: [ROUTE_SURFACE.md](../../../../.graphify/markdown/ROUTE_SURFACE.md)",
      "- [`../README.md`](../README.md) · [`SUMMARY_FOR_AI.md`](SUMMARY_FOR_AI.md) · [`packages/api-server/README.md`](../../../../packages/api-server/README.md)",
    ],
  })
}
