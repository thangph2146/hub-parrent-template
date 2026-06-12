/**
 * Artefact Graphify bổ sung cho agent: IMPACT_RADIUS, ENTRY_POINTS, SYNC_DELTA.
 * Gọi từ graphify-ai-summary.mjs (không chạy độc lập bắt buộc).
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { ROOT: root } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

const MAIN_API = PRODUCT_LINES.main.api.path
const CHECKIN_API = PRODUCT_LINES["hub-event"].api.path

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

function listApiDomains(apiRoot) {
  const src = join(root, apiRoot, "src")
  if (!existsSync(src)) return new Set()
  const domains = new Set()
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
  for (const ent of readdirSync(src, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue
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

/**
 * @param {Map<string, string>} idToPath
 * @param {Array<{ source: string; target: string; relation?: string }>} links
 */
function buildImporterMap(idToPath, links) {
  /** @type {Map<string, string[]>} */
  const importers = new Map()
  for (const link of links) {
    if (link.relation !== "imports") continue
    const sp = idToPath.get(link.source)
    const tp = idToPath.get(link.target)
    if (!sp || !tp) continue
    if (!/^src\/.*\.(tsx?|jsx?)$/i.test(sp)) continue
    if (!/^src\/.*\.(tsx?|jsx?)$/i.test(tp)) continue
    let list = importers.get(tp)
    if (!list) {
      list = []
      importers.set(tp, list)
    }
    if (!list.includes(sp)) list.push(sp)
  }
  return importers
}

/**
 * @param {string} graphifyDir
 * @param {string} appRelPath
 * @param {Array<{ path?: string }>} nodes
 * @param {Array<{ source: string; target: string; relation?: string }>} links
 * @param {Map<string, string>} idToPath
 * @param {string} generatedAt
 */
export function writeImpactRadiusMd(
  graphifyDir,
  appRelPath,
  nodes,
  links,
  idToPath,
  generatedAt
) {
  const importers = buildImporterMap(idToPath, links)
  const inDegree = [...importers.entries()]
    .map(([path, sources]) => ({ path, count: sources.length, sources }))
    .sort((a, b) => b.count - a.count || a.path.localeCompare(b.path))

  const top = inDegree.slice(0, 25)
  const commonHot = inDegree.filter(
    (r) => r.count >= 2 && /^src\/common\//i.test(r.path)
  )
  const entityHot = inDegree.filter(
    (r) => r.count >= 2 && /\/entities\//i.test(r.path)
  )

  const lines = [
    `# Bán kính ảnh hưởng import — ${appRelPath} (Graphify)`,
    "",
    `> **Sinh tự động:** \`${generatedAt}\` từ \`../snapshot/graph.json\` — file **in-degree cao** = nhiều nơi import; sửa cần kiểm tra downstream.`,
    "",
    "Graphify chỉ quét **import tĩnh** trong `src/`; không thấy Nest DI, dynamic import, hay route Next theo convention.",
    "",
    "## Top file theo số nguồn import (in-degree)",
    "",
    "| File | Số importer | Mẫu importer (tối đa 6) |",
    "|------|-------------|-------------------------|",
  ]

  for (const row of top) {
    const sample = row.sources
      .slice(0, 6)
      .map((p) => `\`${p}\``)
      .join(", ")
    lines.push(`| \`${row.path}\` | ${row.count} | ${sample || "—"} |`)
  }
  if (top.length === 0) {
    lines.push("| — | 0 | — |")
  }

  lines.push("")
  lines.push("## `src/common/` — tiện ích dùng chung")
  lines.push("")
  if (commonHot.length) {
    for (const row of commonHot.slice(0, 15)) {
      lines.push(`- \`${row.path}\` — ${row.count} importer`)
    }
  } else {
    lines.push("- (không có file common in-degree ≥ 2)")
  }

  lines.push("")
  lines.push("## Entity / types (`**/entities/**`)")
  lines.push("")
  if (entityHot.length) {
    for (const row of entityHot.slice(0, 15)) {
      lines.push(`- \`${row.path}\` — ${row.count} importer`)
    }
  } else {
    lines.push("- (không có entity in-degree ≥ 2)")
  }

  lines.push("")
  lines.push("## Gợi ý agent")
  lines.push("")
  lines.push(
    "1. Trước khi sửa file in-degree cao → mở mẫu importer ở bảng trên hoặc grep trong app."
  )
  lines.push(
    "2. Sau refactor export/type → chạy `pnpm check` + `graphify-update` app này nếu đổi cấu trúc import."
  )
  lines.push(
    "3. So sánh với [`GRAPH_STATS.md`](GRAPH_STATS.md) (cùng thư mục) — out-degree vs in-degree."
  )
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push(
    `\`node script-system/graphify/graphify-update.cjs ${appRelPath}\` → \`pnpm graphify:ai-summary\`.`
  )
  lines.push("")

  writeFileSync(join(graphifyDir, "IMPACT_RADIUS.md"), lines.join("\n"), "utf8")
}

function basenameMatch(path, pattern) {
  const base = path.split("/").pop() ?? ""
  return pattern.test(base)
}

function scanAutoGenerated(appAbsPath, relPaths) {
  const out = []
  for (const rel of relPaths) {
    if (!/\.tsx?$/i.test(rel)) continue
    const abs = join(appAbsPath, rel)
    if (!existsSync(abs)) continue
    try {
      const head = readFileSync(abs, "utf8").slice(0, 400)
      if (/AUTO-GENERATED/i.test(head)) out.push(normPath(rel))
    } catch {
      /* skip */
    }
  }
  return out.sort((a, b) => a.localeCompare(b))
}

/**
 * @param {string} appRelPath
 * @param {string} graphifyDir
 * @param {Array<{ path?: string }>} nodes
 * @param {string} generatedAt
 */
export function writeEntryPointsMd(appRelPath, graphifyDir, nodes, generatedAt) {
  const filePaths = nodes
    .map((n) => (typeof n.path === "string" ? normPath(n.path) : null))
    .filter((p) => p && /^src\//.test(p) && /\.(tsx?|jsx?)$/i.test(p))

  const bootstrap = []
  const nestModules = []
  const nextRoutes = []
  const nextLoading = []
  const controllers = []

  for (const p of filePaths) {
    if (basenameMatch(p, /^main\.ts$/)) bootstrap.push(p)
    else if (basenameMatch(p, /^app\.module\.ts$/)) bootstrap.push(p)
    else if (basenameMatch(p, /^(instrumentation|middleware)\.ts$/))
      bootstrap.push(p)
    else if (basenameMatch(p, /\.module\.ts$/)) nestModules.push(p)
    else if (basenameMatch(p, /\.controller\.ts$/)) controllers.push(p)
    else if (basenameMatch(p, /^page\.tsx$/)) nextRoutes.push(p)
    else if (basenameMatch(p, /^layout\.tsx$/)) nextRoutes.push(p)
    else if (basenameMatch(p, /^route\.ts$/)) nextRoutes.push(p)
    else if (basenameMatch(p, /^loading\.tsx$/)) nextLoading.push(p)
  }

  const sort = (a) => [...a].sort((x, y) => x.localeCompare(y))
  bootstrap.sort((a, b) => a.localeCompare(b))
  const appAbs = join(root, appRelPath)
  const generated = scanAutoGenerated(appAbs, filePaths)

  const lines = [
    `# Điểm vào (entry) — ${appRelPath} (Graphify)`,
    "",
    `> **Sinh tự động:** \`${generatedAt}\` — bootstrap, module Nest, route Next, file AUTO-GENERATED (đọc header).`,
    "",
    "## Bootstrap / root",
    "",
  ]
  for (const p of sort(bootstrap)) lines.push(`- \`${p}\``)
  if (!bootstrap.length) lines.push("- (không có `main.ts` / `app.module.ts` trong graph)")

  lines.push("")
  lines.push(`## Nest modules (\`*.module.ts\`) — ${nestModules.length} file`)
  lines.push("")
  for (const p of sort(nestModules).slice(0, 40)) lines.push(`- \`${p}\``)
  if (nestModules.length > 40) {
    lines.push(`- … và ${nestModules.length - 40} file khác (xem \`FOLDER_TREE.md\`)`)
  }

  if (controllers.length) {
    lines.push("")
    lines.push(`## Controllers (\`*.controller.ts\`) — ${controllers.length} file`)
    lines.push("")
    for (const p of sort(controllers).slice(0, 30)) lines.push(`- \`${p}\``)
    if (controllers.length > 30) {
      lines.push(`- … và ${controllers.length - 30} controller khác`)
    }
  }

  if (nextRoutes.length) {
    lines.push("")
    lines.push(`## Next App Router (\`page\` / \`layout\` / \`route\`) — ${nextRoutes.length} file`)
    lines.push("")
    for (const p of sort(nextRoutes).slice(0, 50)) lines.push(`- \`${p}\``)
    if (nextRoutes.length > 50) {
      lines.push(`- … và ${nextRoutes.length - 50} route file khác`)
    }
  }

  if (nextLoading.length) {
    lines.push("")
    lines.push(`## \`loading.tsx\` (pattern skeleton) — ${nextLoading.length} file`)
    lines.push("")
    lines.push(
      "Nhiều trang admin dùng cùng pattern loading; ưu tiên sửa shared UI (`@ui`) thay vì từng file."
    )
    lines.push("")
    lines.push(`- Tổng: **${nextLoading.length}** file \`loading.tsx\` trong graph`)
    for (const p of sort(nextLoading).slice(0, 12)) lines.push(`  - \`${p}\``)
    if (nextLoading.length > 12) {
      lines.push(`  - … và ${nextLoading.length - 12} file khác`)
    }
  }

  lines.push("")
  lines.push(`## AUTO-GENERATED (không sửa tay) — ${generated.length} file`)
  lines.push("")
  if (generated.length) {
    lines.push(
      "Sửa generator / config (`api.app.config.json`, `admin.app.config.json`, `pnpm api:generate:*`, `pnpm admin:generate:*`)."
    )
    lines.push("")
    for (const p of generated.slice(0, 35)) lines.push(`- \`${p}\``)
    if (generated.length > 35) {
      lines.push(`- … và ${generated.length - 35} file khác`)
    }
  } else {
    lines.push("- (không phát hiện marker `AUTO-GENERATED` trong header file)")
  }

  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push(
    `\`node script-system/graphify/graphify-update.cjs ${appRelPath}\` → \`pnpm graphify:ai-summary\`.`
  )
  lines.push("")

  writeFileSync(join(graphifyDir, "ENTRY_POINTS.md"), lines.join("\n"), "utf8")
}

export function writeSyncDeltaMd() {
  const mdDir = join(root, ".graphify", "markdown")
  const mainDomains = listApiDomains(MAIN_API)
  const checkinDomains = listApiDomains(CHECKIN_API)
  const exclude = loadSyncExcludeDomains()
  const generatedAt = new Date().toISOString()

  const onBoth = [...mainDomains]
    .filter((d) => checkinDomains.has(d) && !exclude.has(d))
    .sort()
  const onlyMainExcluded = [...exclude].sort()
  const onlyMainNotOnCheckin = [...mainDomains]
    .filter((d) => !checkinDomains.has(d) && !exclude.has(d))
    .sort()
  const onlyCheckin = [...checkinDomains]
    .filter((d) => !mainDomains.has(d))
    .sort()

  const profile = readJson(`${CHECKIN_API}/api.sync-profile.json`)

  const lines = [
    "# SYNC_DELTA — main API ↔ hub-event API (Graphify)",
    "",
    `> **Sinh tự động:** \`${generatedAt}\` — so sánh domain \`src/<tên>/\` giữa \`${MAIN_API}\` và \`${CHECKIN_API}\`, theo \`api.sync-profile.json\`.`,
    "",
    profile?.description ? `> ${profile.description}` : "",
    "",
    "Dev hàng ngày: sửa **`apps/main/api`** (+ `packages/api-server`). Deploy check-in: **`pnpm pull:checkin`**.",
    "",
    "## Domain có trên cả hai (sau sync)",
    "",
  ]
  for (const d of onBoth) lines.push(`- \`${d}\``)
  if (!onBoth.length) lines.push("- (không có domain chung)")

  lines.push("")
  lines.push("## Domain chỉ main — loại trừ bởi `excludeDirs` (không sync sang check-in)")
  lines.push("")
  for (const d of onlyMainExcluded) lines.push(`- \`${d}\``)
  if (!onlyMainExcluded.length) lines.push("- (danh sách exclude trống)")

  if (onlyMainNotOnCheckin.length) {
    lines.push("")
    lines.push("## Domain chỉ main — không có trên check-in (ngoài exclude list)")
    lines.push("")
    for (const d of onlyMainNotOnCheckin) lines.push(`- \`${d}\``)
  }

  if (onlyCheckin.length) {
    lines.push("")
    lines.push("## Domain chỉ hub-event (native check-in, không từ main)")
    lines.push("")
    for (const d of onlyCheckin) lines.push(`- \`${d}\``)
  }

  lines.push("")
  lines.push("## Quy trình agent")
  lines.push("")
  lines.push("1. Sửa logic API dùng chung → `apps/main/api` hoặc `packages/api-server`.")
  lines.push("2. Chạy `pnpm pull:checkin` trước khi test/deploy line check-in.")
  lines.push(
    "3. File AUTO-GENERATED trên hub-event → xem [`apps/hub-event/api/.graphify/markdown/ENTRY_POINTS.md`](../apps/hub-event/api/.graphify/markdown/ENTRY_POINTS.md)."
  )
  lines.push(
    "4. Bảng module admin ↔ API: [`TASK_INDEX.md`](TASK_INDEX.md)."
  )
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push("- `pnpm graphify:ai-summary`")
  lines.push("")

  writeFileSync(join(mdDir, "SYNC_DELTA.md"), lines.join("\n"), "utf8")
  console.log(`[graphify-agent-artifacts] Đã ghi ${join(mdDir, "SYNC_DELTA.md")}`)
}

/**
 * @param {string} appAbs
 * @param {(relFromApp: string) => void} onFile rel path under app e.g. src/app/...
 */
function walkAppSrc(appAbs, onFile) {
  const src = join(appAbs, "src")
  if (!existsSync(src)) return
  /** @param {string} dir */
  function walk(dir) {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, ent.name)
      if (ent.isDirectory()) {
        if (ent.name === "node_modules" || ent.name === "dist") continue
        walk(abs)
      } else if (/\.(tsx?|jsx?)$/.test(ent.name)) {
        onFile(normPath(abs.slice(appAbs.length + 1)))
      }
    }
  }
  walk(src)
}

/**
 * @param {string} content
 * @returns {{ clusterId: string; label: string } | null}
 */
function classifyPatternSignature(content) {
  const trimmed = content.trim()
  if (!trimmed.length || trimmed.length > 800) return null

  const reexport = trimmed.match(
    /export\s+\{[^}]+\}\s+from\s+["']([^"']+)["']/
  )
  if (reexport && /AUTO-GENERATED/i.test(trimmed)) {
    const normalized = reexport[1].replace(
      /@workspace\/admin-app\/modules\/[^/]+/,
      "@workspace/admin-app/modules/*"
    )
    return {
      clusterId: `auto-reexport:${normalized}`,
      label: `AUTO-GENERATED re-export → ${normalized}`,
    }
  }

  const variant = trimmed.match(/AdminRouteLoading\s+variant=["'](\w+)["']/)
  if (variant) {
    return {
      clusterId: `AdminRouteLoading:${variant[1]}`,
      label: `AdminRouteLoading variant="${variant[1]}" (@ui)`,
    }
  }

  if (reexport && trimmed.length < 400) {
    const normalized = reexport[1].replace(
      /@workspace\/admin-app\/modules\/[^/]+/,
      "@workspace/admin-app/modules/*"
    )
    return {
      clusterId: `reexport:${normalized}`,
      label: `Re-export → ${normalized}`,
    }
  }

  return null
}

/**
 * @param {string} appRelPath
 * @param {string} generatedAt
 */
export function writePatternClustersMd(appRelPath, generatedAt) {
  const appAbs = join(root, appRelPath)
  const markdownDir = join(appAbs, ".graphify", "markdown")
  /** @type {Map<string, { label: string; files: string[] }>} */
  const clusters = new Map()
  /** @type {Map<string, number>} */
  const byBasename = new Map()

  walkAppSrc(appAbs, (rel) => {
    const base = rel.split("/").pop() ?? rel
    byBasename.set(base, (byBasename.get(base) ?? 0) + 1)

    const abs = join(appAbs, rel)
    let content
    try {
      content = readFileSync(abs, "utf8")
    } catch {
      return
    }
    const sig = classifyPatternSignature(content)
    if (!sig) return
    let row = clusters.get(sig.clusterId)
    if (!row) {
      row = { label: sig.label, files: [] }
      clusters.set(sig.clusterId, row)
    }
    row.files.push(rel)
  })

  const sortedClusters = [...clusters.entries()]
    .map(([id, row]) => ({ id, ...row, count: row.files.length }))
    .filter((c) => c.count >= 2)
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))

  const lines = [
    `# Pattern clusters — ${appRelPath} (Graphify)`,
    "",
    `> **Sinh tự động:** \`${generatedAt}\` — nhóm file **cùng boilerplate** (re-export AUTO-GENERATED, \`AdminRouteLoading\`, v.v.).`,
    "",
    "Mục tiêu: agent biết chỗ **sửa một lần** (admin-app / `@ui`) thay vì lặp từng file host.",
    "",
    "## Theo signature nội dung (count ≥ 2)",
    "",
  ]

  if (sortedClusters.length) {
    for (const c of sortedClusters) {
      lines.push(`### ${c.label} (${c.count} file)`)
      lines.push("")
      for (const f of c.files.slice(0, 8)) lines.push(`- \`${f}\``)
      if (c.files.length > 8) {
        lines.push(`- … và ${c.files.length - 8} file tương tự`)
      }
      lines.push("")
    }
  } else {
    lines.push("- (không có cluster count ≥ 2)")
    lines.push("")
  }

  lines.push("## Theo tên file (basename)")
  lines.push("")
  lines.push("| Basename | Số file | Gợi ý |")
  lines.push("|----------|---------|--------|")
  const hotNames = [...byBasename.entries()]
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
  for (const [name, count] of hotNames) {
    let hint = "—"
    if (name === "loading.tsx") {
      hint = "Sửa `AdminRouteLoading` trong `@ui` hoặc module `admin-app`"
    } else if (name === "page.tsx") {
      hint = "CRUD page — logic trong `packages/admin-app`"
    }
    lines.push(`| \`${name}\` | ${count} | ${hint} |`)
  }
  if (!hotNames.length) lines.push("| — | 0 | — |")

  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push(
    `\`node script-system/graphify/graphify-update.cjs ${appRelPath}\` → \`pnpm graphify:ai-summary\`.`
  )
  lines.push("")

  writeFileSync(join(markdownDir, "PATTERN_CLUSTERS.md"), lines.join("\n"), "utf8")
}

/**
 * @param {string} appRelPath
 * @param {Array<{ path?: string }>} nodes
 * @param {Array<{ source: string; target: string; relation?: string }>} links
 * @param {Map<string, string>} idToPath
 * @param {string} generatedAt
 * @returns {{ impactRadiusRel?: string; entryPointsRel?: string; patternClustersRel?: string }}
 */
export function writeAgentArtifactsForApp(
  appRelPath,
  nodes,
  links,
  idToPath,
  generatedAt
) {
  const markdownDir = join(root, appRelPath, ".graphify", "markdown")
  writeImpactRadiusMd(
    markdownDir,
    appRelPath,
    nodes,
    links,
    idToPath,
    generatedAt
  )
  writeEntryPointsMd(appRelPath, markdownDir, nodes, generatedAt)
  writePatternClustersMd(appRelPath, generatedAt)
  return {
    impactRadiusRel: `${appRelPath}/.graphify/markdown/IMPACT_RADIUS.md`,
    entryPointsRel: `${appRelPath}/.graphify/markdown/ENTRY_POINTS.md`,
    patternClustersRel: `${appRelPath}/.graphify/markdown/PATTERN_CLUSTERS.md`,
  }
}
