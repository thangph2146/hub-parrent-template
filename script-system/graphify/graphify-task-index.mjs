/**
 * Sinh TASK_INDEX (module/feature → file path) cho agent.
 * Chạy: node script-system/graphify/graphify-task-index.mjs
 * Hoặc qua: pnpm graphify:ai-summary
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { ROOT: root } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

const MAIN_BACKEND = PRODUCT_LINES.main.backend.path
const MAIN_API = PRODUCT_LINES.main.api.path
const CHECKIN_API = PRODUCT_LINES["hub-event"].api.path
const CHECKIN_FRONT = PRODUCT_LINES["hub-event"].frontend.path
const ADMIN_APP = "packages/admin-app"

/** Admin module id → API domain folder (khi khác tên). */
const ADMIN_TO_API_DOMAIN = {
  staff: "users",
  rbac: "roles",
  guides: "page-contents",
  "file-storage": "uploads",
  "my-students": "students",
}

/** API domain → api-client resource file (khi khác tên). */
const API_TO_CLIENT_RESOURCE = {
  "page-contents": "guides",
  roles: "rbac",
}

const VI_ALIASES = {
  staff: ["nhân sự", "nhan su", "user", "users"],
  rbac: ["vai trò", "vai tro", "role", "roles", "quyền", "quyen"],
  orders: ["đơn hàng", "don hang", "order"],
  products: ["sản phẩm", "san pham", "product"],
  events: ["sự kiện", "su kien", "event", "check-in", "checkin", "check in"],
  categories: ["danh mục", "danh muc", "category"],
  posts: ["bài viết", "bai viet", "post"],
  cameras: ["camera"],
  screens: ["màn hình", "man hinh", "screen"],
  speakers: ["diễn giả", "dien gia", "speaker"],
  locations: ["địa điểm", "dia diem", "location"],
  uploads: ["upload", "tệp", "tep", "file-storage", "file storage"],
  "promo-codes": ["mã giảm", "ma giam", "promo", "voucher"],
  "contact-requests": ["liên hệ", "lien he", "contact"],
  "parent-students": ["phụ huynh", "phu huynh", "parent"],
  settings: ["cài đặt", "cai dat", "setting"],
  data: ["import", "dữ liệu", "du lieu"],
  dashboard: ["tổng quan", "tong quan", "dashboard"],
  system: ["hệ thống", "he thong", "system"],
  auth: ["đăng nhập", "dang nhap", "auth", "login"],
  public: ["public", "storefront"],
  ui: ["component", "giao diện", "giao dien", "@ui"],
  "api-client": ["sdk", "api client", "http client"],
  "api-server": ["base service", "generate api", "api-server"],
  "admin-app": ["admin crud", "admin-app", "admin app"],
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

function apiDomainForAdminModule(moduleId) {
  return ADMIN_TO_API_DOMAIN[moduleId] ?? moduleId
}

function clientResourceForApiDomain(apiDomain) {
  const mapped = API_TO_CLIENT_RESOURCE[apiDomain] ?? apiDomain
  const rel = `packages/api-client/src/resources/${mapped}.ts`
  return existsSync(join(root, rel)) ? rel : null
}

function listApiDomains(apiRoot) {
  const src = join(root, apiRoot, "src")
  if (!existsSync(src)) return new Set()
  const domains = new Set()
  for (const ent of readdirSync(src, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue
    const skip = new Set([
      "entities",
      "migrations",
      "mikro-orm",
      "config",
      "common",
      "seeders",
      "seeds",
      "scripts",
    ])
    if (skip.has(ent.name)) continue
    domains.add(ent.name)
  }
  return domains
}

function loadSyncExcludeDomains() {
  const profile = readJson(`${CHECKIN_API}/api.sync-profile.json`)
  if (!profile?.excludeDirs) return new Set()
  return new Set(
    profile.excludeDirs.map((d) => d.replace(/^src\//, "").replace(/\/$/, ""))
  )
}

function permissionPrefix(mainAdminConfig, moduleId) {
  const map = mainAdminConfig?.pageGuardPermissionPrefix ?? {}
  return map[moduleId] ?? null
}

export function buildTaskCatalog() {
  const generatedAt = new Date().toISOString()
  const mainAdmin = readJson(`${MAIN_BACKEND}/admin.app.config.json`)
  const checkinAdmin = readJson(`${CHECKIN_FRONT}/admin.app.config.json`)
  const syncExclude = loadSyncExcludeDomains()
  const mainApiDomains = listApiDomains(MAIN_API)

  const modules = []

  const mainModules = mainAdmin?.modules ?? []
  for (const moduleId of mainModules) {
    const apiDomain = apiDomainForAdminModule(moduleId)
    const onMainApi = mainApiDomains.has(apiDomain)
    // hub-event kế thừa main API — domain có trên check-in nếu không nằm exclude sync
    const checkinApiAvailable = onMainApi && !syncExclude.has(apiDomain)

    modules.push({
      id: moduleId,
      keywords: [moduleId, apiDomain, ...(VI_ALIASES[moduleId] ?? [])],
      permissionPrefix: permissionPrefix(mainAdmin, moduleId),
      paths: {
        adminApp: `${ADMIN_APP}/src/modules/${moduleId}/`,
        mainBackendPage: `${MAIN_BACKEND}/src/app/${moduleId}/page.tsx`,
        mainApi: onMainApi ? `${MAIN_API}/src/${apiDomain}/` : null,
        apiClient: clientResourceForApiDomain(apiDomain),
      },
      lines: {
        main: true,
        checkinAdmin: (checkinAdmin?.modules ?? []).includes(moduleId),
        checkinApi: checkinApiAvailable,
      },
      verify: buildVerifyHints(moduleId, apiDomain, {
        admin: true,
        api: onMainApi,
        checkinSync: onMainApi && checkinApiAvailable,
      }),
      docs: [
        "docs/admin-pattern/ADMIN_PAGE_PATTERN.md",
        onMainApi ? "docs/api-pattern/README.md" : null,
      ].filter(Boolean),
    })
  }

  // Package / infra rows
  const packageRows = [
    {
      id: "ui",
      keywords: ["ui", "@ui", "component", ...(VI_ALIASES.ui ?? [])],
      paths: {
        package: "packages/ui/src/",
        doc: "docs/ui-pattern/README.md",
      },
      verify: ["pnpm --filter @workspace/ui lint"],
      docs: ["docs/ui-pattern/README.md"],
    },
    {
      id: "api-client",
      keywords: ["api-client", "sdk", ...(VI_ALIASES["api-client"] ?? [])],
      paths: {
        package: "packages/api-client/src/",
        doc: "docs/api-client-pattern/README.md",
      },
      verify: ["pnpm verify:api-contract", "pnpm verify:sdk-http"],
      docs: ["docs/api-client-pattern/README.md"],
    },
    {
      id: "api-server",
      keywords: ["api-server", "generate api", ...(VI_ALIASES["api-server"] ?? [])],
      paths: {
        package: "packages/api-server/src/",
        checkinConfig: `${CHECKIN_API}/api.app.config.json`,
        doc: "packages/api-server/README.md",
      },
      verify: [
        "pnpm --filter @workspace/api-server run build",
        "pnpm api:generate:checkin",
        "pnpm verify:checkin-api",
      ],
      docs: ["packages/api-server/README.md", "docs/api-pattern/README.md"],
    },
    {
      id: "admin-app",
      keywords: ["admin-app", ...(VI_ALIASES["admin-app"] ?? [])],
      paths: {
        package: `${ADMIN_APP}/src/`,
        mainConfig: `${MAIN_BACKEND}/admin.app.config.json`,
        doc: "docs/admin-pattern/ADMIN_APP_PACKAGE.md",
      },
      verify: ["pnpm verify:main-admin", "pnpm verify:checkin-admin"],
      docs: ["docs/admin-pattern/ADMIN_APP_PACKAGE.md"],
    },
  ]

  const nativeMain = (mainAdmin?.native?.files ?? []).map(
    (f) => `${MAIN_BACKEND}/src/app/${f}`
  )
  const nativeCheckin = (checkinAdmin?.native?.files ?? []).map(
    (f) => `${CHECKIN_FRONT}/src/app/${f.replace(/^\//, "")}`
  )

  return {
    generatedAt,
    productLines: PRODUCT_LINES,
    modules,
    packages: packageRows,
    native: { main: nativeMain, checkin: nativeCheckin },
    syncExclude: [...syncExclude],
    devRule:
      "Dev hàng ngày: sửa apps/main/* + packages/*; hub-event cập nhật qua pnpm pull:checkin.",
  }
}

function buildVerifyHints(moduleId, apiDomain, flags) {
  const cmds = ["pnpm check"]
  if (flags.admin) {
    cmds.push("pnpm verify:main-admin")
    if (moduleId !== "settings") cmds.push("pnpm verify:permissions")
  }
  if (flags.api) {
    cmds.push("pnpm verify:api-contract")
  }
  if (flags.checkinSync) {
    cmds.push("pnpm pull:checkin")
    cmds.push("pnpm verify:checkin-api")
    cmds.push("pnpm verify:api-profile")
    cmds.push("pnpm verify:checkin-admin")
  }
  return [...new Set(cmds)]
}

function normalizeText(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[_/]+/g, " ")
}

function scoreRow(row, normalizedTask) {
  let score = 0
  const terms = [row.id, ...(row.keywords ?? [])]
  for (const term of terms) {
    const t = normalizeText(term)
    if (!t) continue
    if (normalizedTask.includes(t)) score += t.length >= 4 ? 8 : 4
    if (t.length >= 3 && normalizedTask.split(/\s+/).some((w) => w === t))
      score += 6
  }
  return score
}

export function matchTaskToBrief(catalog, taskText) {
  const normalized = normalizeText(taskText)
  const moduleScores = catalog.modules
    .map((m) => ({ row: m, score: scoreRow(m, normalized) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const packageScores = catalog.packages
    .map((p) => ({ row: p, score: scoreRow(p, normalized) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const topModule = moduleScores[0]?.row ?? null
  const topPackage = packageScores[0]?.row ?? null
  const pick = topModule ?? topPackage

  const productLine = inferProductLine(normalized, pick)
  const reads = [
    "AGENTS.md (mục 2–3)",
    "docs/admin-pattern/PRE_CODE_PROTOCOL.md",
    ".graphify/markdown/TASK_INDEX.md",
  ]
  if (pick?.docs?.length) reads.push(...pick.docs)

  const files = []
  if (topModule?.paths) {
    if (topModule.paths.adminApp) files.push(topModule.paths.adminApp)
    if (topModule.paths.mainBackendPage) files.push(topModule.paths.mainBackendPage)
    if (topModule.paths.mainApi) files.push(topModule.paths.mainApi)
    if (topModule.paths.apiClient) files.push(topModule.paths.apiClient)
  }
  if (topPackage?.paths) {
    for (const v of Object.values(topPackage.paths)) {
      if (typeof v === "string") files.push(v)
    }
  }

  const verify = pick?.verify ?? ["pnpm check"]
  const sync =
    topModule?.lines?.checkinApi && topModule?.paths?.mainApi
      ? "Sửa apps/main/api → chạy pnpm pull:checkin sau khi xong."
      : topModule?.paths?.mainApi
        ? "Xem .graphify/markdown/SYNC_DELTA.md — domain main vs hub-event."
        : null

  const graphify = []
  if (topModule?.paths?.mainApi) {
    graphify.push(
      `${MAIN_API}/.graphify/markdown/API_DOMAIN_IMPORTS.md`,
      `${MAIN_API}/.graphify/markdown/IMPACT_RADIUS.md`,
      `${MAIN_API}/.graphify/markdown/ENTRY_POINTS.md`,
      `${MAIN_BACKEND}/.graphify/markdown/FOLDER_TREE.md`,
      `${MAIN_BACKEND}/.graphify/markdown/PATTERN_CLUSTERS.md`,
      ".graphify/markdown/ROUTE_SURFACE.md"
    )
    if (topModule.lines?.checkinApi) {
      graphify.push(".graphify/markdown/SYNC_DELTA.md")
    }
  } else if (topPackage?.paths?.package?.includes("admin-app")) {
    graphify.push(
      `packages/admin-app/.graphify/markdown/SUMMARY_FOR_AI.md`,
      `packages/admin-app/.graphify/markdown/PATTERN_CLUSTERS.md`,
      `${MAIN_BACKEND}/.graphify/markdown/ENTRY_POINTS.md`
    )
  } else if (topPackage?.id === "ui") {
    graphify.push(
      `packages/ui/.graphify/markdown/SUMMARY_FOR_AI.md`,
      `packages/ui/.graphify/markdown/IMPACT_RADIUS.md`
    )
  } else if (topPackage?.id === "api-client") {
    graphify.push(
      `packages/api-client/.graphify/markdown/SUMMARY_FOR_AI.md`,
      ".graphify/markdown/ROUTE_SURFACE.md"
    )
  } else if (topPackage?.id === "api-server") {
    graphify.push(`packages/api-server/.graphify/markdown/SUMMARY_FOR_AI.md`)
  } else {
    graphify.push(`${MAIN_BACKEND}/.graphify/markdown/SUMMARY_FOR_AI.md`)
  }

  return {
    task: taskText,
    productLine,
    match: pick
      ? { type: topModule ? "module" : "package", id: pick.id, score: (topModule ? moduleScores[0] : packageScores[0]).score }
      : null,
    alternates: moduleScores.slice(1, 4).map((x) => x.row.id),
    reads: [...new Set(reads)],
    files: [...new Set(files)],
    verify,
    sync,
    graphify: [...new Set(graphify)],
  }
}

function inferProductLine(normalizedTask, pick) {
  if (/checkin|check-in|hub-event|su kien/.test(normalizedTask)) return "hub-event"
  if (/store-sync|store sync|cua hang/.test(normalizedTask)) return "store-sync"
  if (/storefront|hub-parent|frontend/.test(normalizedTask)) return "hub-parent"
  if (pick?.id === "api-server" || pick?.lines?.checkinApi) return "main + hub-event (sync)"
  return "main (apps/main/* + packages/*)"
}

function escCell(s) {
  return String(s ?? "—").replace(/\|/g, "\\|")
}

export function writeTaskIndexArtifacts(catalog = buildTaskCatalog()) {
  const mdDir = join(root, ".graphify", "markdown")
  mkdirSync(mdDir, { recursive: true })
  const jsonPath = join(mdDir, "task-index.json")
  const mdPath = join(mdDir, "TASK_INDEX.md")

  writeFileSync(jsonPath, JSON.stringify(catalog, null, 2), "utf8")

  const lines = []
  lines.push("# TASK_INDEX — module/feature → file (Graphify)")
  lines.push("")
  lines.push(
    `> **Sinh tự động:** \`${catalog.generatedAt}\` — từ \`admin.app.config.json\`, \`api.sync-profile.json\`, \`packages/api-client\`. Đọc kèm [\`AGENTS.md\`](../AGENTS.md).`
  )
  lines.push("")
  lines.push("## Brief nhanh (agent)")
  lines.push("")
  lines.push("```bash")
  lines.push('pnpm graphify:brief --task "mô tả task ngắn"')
  lines.push("```")
  lines.push("")
  lines.push(`> ${catalog.devRule}`)
  lines.push("")
  lines.push("## Admin modules (main)")
  lines.push("")
  lines.push(
    "| Module | API domain | Admin-app | Main backend | Main API | API client | Check-in API |"
  )
  lines.push(
    "|--------|------------|-----------|--------------|----------|------------|--------------|"
  )
  for (const m of catalog.modules) {
    lines.push(
      `| \`${escCell(m.id)}\` | \`${escCell(apiDomainForAdminModule(m.id))}\` | \`${escCell(m.paths.adminApp)}\` | \`${escCell(m.paths.mainBackendPage)}\` | \`${escCell(m.paths.mainApi)}\` | \`${escCell(m.paths.apiClient)}\` | ${m.lines.checkinApi ? "✓" : "—"} |`
    )
  }
  lines.push("")
  lines.push("## Packages workspace")
  lines.push("")
  lines.push("| Id | Path chính | Verify |")
  lines.push("|----|------------|--------|")
  for (const p of catalog.packages) {
    const mainPath =
      p.paths.package ?? p.paths.doc ?? Object.values(p.paths)[0]
    lines.push(
      `| \`${escCell(p.id)}\` | \`${escCell(mainPath)}\` | ${escCell((p.verify ?? []).join(", "))} |`
    )
  }
  lines.push("")
  lines.push("## Native pages (không generate từ admin-app)")
  lines.push("")
  lines.push("**Main backend:**")
  for (const f of catalog.native.main) lines.push(`- \`${f}\``)
  lines.push("")
  lines.push("**Check-in frontend:**")
  for (const f of catalog.native.checkin) lines.push(`- \`${f}\``)
  lines.push("")
  lines.push("## Hub-event — domain loại trừ khi sync từ main")
  lines.push("")
  lines.push(
    "Chi tiết so sánh main ↔ check-in: [`SYNC_DELTA.md`](SYNC_DELTA.md). Các domain **exclude** (chỉ sửa `apps/main/api`):"
  )
  lines.push("")
  for (const d of catalog.syncExclude) lines.push(`- \`${d}\``)
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push("- `pnpm graphify:ai-summary` hoặc `node script-system/graphify/graphify-task-index.mjs`")
  lines.push("")

  writeFileSync(mdPath, lines.join("\n"), "utf8")
  console.log(`[graphify-task-index] Đã ghi ${mdPath}`)
  console.log(`[graphify-task-index] Đã ghi ${jsonPath}`)
  return { mdPath, jsonPath, catalog }
}

const __self = resolve(fileURLToPath(import.meta.url))
if (process.argv[1] && resolve(process.argv[1]) === __self) {
  writeTaskIndexArtifacts()
}
