/**
 * Từ apps/<app>/.graphify/snapshot/context.json tạo markdown/SUMMARY_FOR_AI.md — gọn, không nhúng full source,
 * để AI định hướng codebase (routes, import graph) mà không đốt token.
 *
 * Chạy: pnpm graphify:ai-summary
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { ROOT: root } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

/** Thư mục con chuẩn trong mỗi `.graphify/`: JSON snapshot vs Markdown cho AI. */
const GRAPHIFY_MARKDOWN = "markdown"
const GRAPHIFY_SNAPSHOT = "snapshot"

/**
 * @typedef {{ path: string; pkg: string; label: string; kind: "api" | "next" }} GraphifyApp
 */

/** @type {GraphifyApp[]} */
const GRAPHIFY_APPS = []
for (const [line, apps] of Object.entries(PRODUCT_LINES)) {
  for (const [role, entry] of Object.entries(apps)) {
    const kind = role === "api" ? "api" : "next"
    const roleLabel =
      role === "api"
        ? "API Nest"
        : role === "backend"
          ? "Admin Next"
          : "Next frontend"
    GRAPHIFY_APPS.push({
      path: entry.path.replace(/\\/g, "/"),
      pkg: entry.package,
      label: `${roleLabel} (${line}) — ${entry.package}`,
      kind,
    })
  }
}

/** Đường dẫn tương đối từ `apps/.../.graphify/markdown/` lên root repo. */
function repoRelFromAppMarkdown(appRelPath) {
  const depth = appRelPath.split("/").length + 2
  return `${"../".repeat(depth)}`
}

/** @param {string} appRelPath ví dụ `apps/main/api` */
function appGraphifyBase(appRelPath) {
  return join(root, appRelPath, ".graphify")
}

function appMarkdownDir(appRelPath) {
  return join(appGraphifyBase(appRelPath), GRAPHIFY_MARKDOWN)
}

function appSnapshotDir(appRelPath) {
  return join(appGraphifyBase(appRelPath), GRAPHIFY_SNAPSHOT)
}

function appContextPath(appRelPath) {
  return join(appSnapshotDir(appRelPath), "context.json")
}

function appGraphJsonPath(appRelPath) {
  return join(appSnapshotDir(appRelPath), "graph.json")
}

/** @param {GraphifyApp | string} app */
function isNestApiApp(app) {
  if (typeof app === "string") {
    return app.replace(/\\/g, "/").endsWith("/api")
  }
  return app.kind === "api"
}

/** @param {GraphifyApp} app */
function isStorefrontNext(app) {
  return app.kind === "next" && /frontend/.test(app.path)
}

function packagesGraphifyBase() {
  return join(root, "packages", ".graphify")
}

function packagesMarkdownDir() {
  return join(packagesGraphifyBase(), GRAPHIFY_MARKDOWN)
}

function rootGraphifyBase() {
  return join(root, ".graphify")
}

function rootMarkdownDir() {
  return join(rootGraphifyBase(), GRAPHIFY_MARKDOWN)
}

/** Xóa Markdown cũ ở root `.graphify/` app (trước khi có thư mục `markdown/`). Không xóa `context.json`/`graph.json` ở root — để `update.cjs` di chuyển/xóa sau khi ghi `snapshot/`. */
function removeLegacyAppGraphifyFiles(appDir) {
  const base = appGraphifyBase(appDir)
  for (const f of [
    "SUMMARY_FOR_AI.md",
    "FOLDER_TREE.md",
    "GRAPH_STATS.md",
    "API_DOMAIN_IMPORTS.md",
  ]) {
    const p = join(base, f)
    if (existsSync(p)) {
      try {
        unlinkSync(p)
        console.log(`[graphify-ai-summary] Đã xóa legacy ${p}`)
      } catch {
        /* ignore */
      }
    }
  }
}

function removeLegacyPackagesGraphifyMarkdown() {
  const base = packagesGraphifyBase()
  for (const f of ["SUMMARY_FOR_AI.md", "WORKSPACE_DEPS.md"]) {
    const p = join(base, f)
    if (existsSync(p)) {
      try {
        unlinkSync(p)
        console.log(`[graphify-ai-summary] Đã xóa legacy ${p}`)
      } catch {
        /* ignore */
      }
    }
  }
}

function removeLegacyRootGraphifySummary() {
  const p = join(rootGraphifyBase(), "SUMMARY_FOR_AI.md")
  if (existsSync(p)) {
    try {
      unlinkSync(p)
      console.log(`[graphify-ai-summary] Đã xóa legacy ${p}`)
    } catch {
      /* ignore */
    }
  }
}

/**
 * Mục lục artefact trong cùng app (markdown vs snapshot).
 * @param {string} appRelPath
 */
function linesAppMarkdownToc(appRelPath) {
  const parts = [
    "## Mục lục artefact Graphify",
    "",
    "- **Markdown (ưu tiên đọc):** file này — [`FOLDER_TREE.md`](FOLDER_TREE.md), [`GRAPH_STATS.md`](GRAPH_STATS.md)",
  ]
  if (isNestApiApp(appRelPath)) {
    parts[parts.length - 1] +=
      " — [`API_DOMAIN_IMPORTS.md`](API_DOMAIN_IMPORTS.md)"
  }
  parts.push(
    "- **Snapshot (JSON nặng):** [`../snapshot/context.json`](../snapshot/context.json), [`../snapshot/graph.json`](../snapshot/graph.json) — chỉ mở khi cần trích source hoặc đồ thị đầy đủ."
  )
  parts.push(
    "- **Quy ước thư mục `.graphify` (tay):** [`../README.md`](../README.md)."
  )
  parts.push("")
  return parts
}

/**
 * Liên kết sang app khác + tài liệu hub (ranh giới microservice).
 * @param {GraphifyApp} app
 */
function linesAppServiceAndHubDocs(app) {
  const r = repoRelFromAppMarkdown(app.path)
  const lines = [
    "## Liên kết dịch vụ & tài liệu hub",
    "",
    "App **không** import chéo source `apps/*`; giao tiếp qua **HTTP** + `@workspace/api-client` (và `fetch` public ở storefront khi cần).",
    "",
    "### Graphify — markdown các phần còn lại của monorepo",
    "",
  ]
  for (const o of GRAPHIFY_APPS) {
    if (o.path === app.path) continue
    lines.push(
      `- **${o.pkg}:** [SUMMARY](${r}${o.path}/.graphify/markdown/SUMMARY_FOR_AI.md) · [FOLDER_TREE](${r}${o.path}/.graphify/markdown/FOLDER_TREE.md) · [GRAPH_STATS](${r}${o.path}/.graphify/markdown/GRAPH_STATS.md)`
    )
  }
  lines.push(
    `- **packages:** [SUMMARY](${r}packages/.graphify/markdown/SUMMARY_FOR_AI.md) · [WORKSPACE_DEPS](${r}packages/.graphify/markdown/WORKSPACE_DEPS.md)`
  )
  lines.push(
    `- **monorepo (chỉ mục + chủ đề):** [SUMMARY gốc](${r}.graphify/markdown/SUMMARY_FOR_AI.md)`
  )
  lines.push("")
  lines.push("### Tài liệu hub (không sinh bởi Graphify)")
  lines.push("")
  lines.push(
    `- [MICROSERVICE_SYSTEM_MAP](${r}docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) — boundaries, ORM, checklist.`
  )
  lines.push(
    `- [AGENTS_GUIDE](${r}docs/admin-pattern/AGENTS_GUIDE.md) — thứ tự đọc cho agent.`
  )
  lines.push(`- [AGENTS.md](${r}AGENTS.md) — \`pnpm check\`, \`check:full\`.`)
  if (isStorefrontNext(app)) {
    lines.push(
      `- [FRONTEND_UX](${r}docs/admin-pattern/FRONTEND_UX.md) — UX / token / a11y storefront.`
    )
  }
  lines.push("")
  return lines
}

/**
 * Gợi ý “ngóc ngách” từ danh sách file trong snapshot (không đọc nội dung).
 * @param {GraphifyApp} app
 * @param {string[]} paths
 */
function linesAppSystemNooks(app, paths) {
  const lines = []
  if (isNestApiApp(app)) {
    const take = (pred, n = 14) => paths.filter(pred).slice(0, n)
    const seeds = take((p) => /\/seeds\//.test(p) || p.startsWith("src/seeds/"))
    const config = take((p) => p.startsWith("src/config/"))
    const guards = take((p) => /\.guard\.ts$/.test(p))
    const dtos = take((p) => /\.dto\.ts$/.test(p))
    if (!seeds.length && !config.length && !guards.length && !dtos.length) {
      return lines
    }
    lines.push("## Góc hệ thống (@api) — đường dẫn gợi ý")
    lines.push("")
    const block = (title, arr) => {
      if (!arr.length) return
      lines.push(`### ${title}`)
      for (const p of arr) lines.push(`- \`${p}\``)
      lines.push("")
    }
    block("Cấu hình runtime (`src/config/`)", config)
    block("Guards", guards)
    block("DTO", dtos)
    block("Seeds / bootstrap", seeds)
    lines.push(
      "> **DB:** entity `src/entities/`, migration `src/migrations/` — xem thêm bảng *Module map* và `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md` (MikroORM)."
    )
    lines.push("")
    return lines
  }
  const mw = paths.find((p) => /(^|\/)middleware\.tsx?$/.test(p))
  const inst = paths.find((p) => /(^|\/)instrumentation\.tsx?$/.test(p))
  const rootLayout = paths.find(
    (p) => p === "src/app/layout.tsx" || p === "src/app/layout.ts"
  )
  const apiRouteCount = paths.filter((p) => /^src\/app\/api\//.test(p)).length
  if (!mw && !inst && !rootLayout && apiRouteCount === 0) {
    return lines
  }
  lines.push(`## Góc hệ thống (${app.pkg}) — đường dẫn gợi ý`)
  lines.push("")
  if (mw) lines.push(`- **Middleware:** \`${mw}\``)
  if (inst) lines.push(`- **Instrumentation:** \`${inst}\``)
  if (rootLayout) lines.push(`- **Root layout:** \`${rootLayout}\``)
  if (apiRouteCount)
    lines.push(
      `- **Route handlers dưới \`src/app/api/\`:** ${apiRouteCount} file (danh sách \`apiRoutes\` ở trên nếu có).`
    )
  lines.push("")
  return lines
}

function normPath(p) {
  return String(p).replace(/\\/g, "/")
}

/**
 * Domain Nest / feature = segment đầu tiên sau `src/` (file nằm trực tiếp trong `src/` → `_root`).
 * @param {string} relPath
 */
function domainFromSrcPath(relPath) {
  const s = normPath(relPath)
  if (!s.startsWith("src/")) return null
  const rest = s.slice(4)
  const first = rest.split("/")[0]
  if (!first) return null
  if (first.includes(".")) return "_root"
  return first
}

/**
 * @param {Array<{ id: string; path?: string; type?: string }>} nodes
 * @param {string} rootPrefix ví dụ `src`
 */
function collectDirectoryPathsForTree(nodes, rootPrefix = "src") {
  const set = new Set()
  for (const n of nodes) {
    if (typeof n.path !== "string") continue
    const p = normPath(n.path)
    if (p !== rootPrefix && !p.startsWith(`${rootPrefix}/`)) continue
    if (n.type !== "directory" && n.type !== "route-group") continue
    set.add(p)
  }
  return [...set].sort()
}

/** @param {Record<string, Record<string, unknown>>} nested */
function renderNestedDirTree(nested, prefix = "") {
  const lines = []
  const keys = Object.keys(nested).sort((a, b) => a.localeCompare(b, "en"))
  keys.forEach((key, i) => {
    const isLast = i === keys.length - 1
    const branch = isLast ? "└── " : "├── "
    const child = /** @type {Record<string, Record<string, unknown>>} */ (
      nested[key]
    )
    if (prefix === "" && keys.length === 1 && key === "src") {
      lines.push("src/")
      lines.push(...renderNestedDirTree(child, ""))
      return
    }
    lines.push(`${prefix}${branch}${key}/`)
    const childPrefix = prefix + (isLast ? "    " : "│   ")
    lines.push(...renderNestedDirTree(child, childPrefix))
  })
  return lines
}

function buildNestedFromPaths(paths) {
  /** @type {Record<string, Record<string, unknown>>} */
  const root = {}
  for (const raw of paths) {
    const parts = normPath(raw).split("/").filter(Boolean)
    let cur = root
    for (const seg of parts) {
      if (!cur[seg]) cur[seg] = {}
      cur = cur[seg]
    }
  }
  return root
}

/** @param {string} d */
function mermaidDomainId(d) {
  const slug = d === "_root" ? "root" : d.replace(/[^a-zA-Z0-9_]/g, "_")
  return `dom_${slug}`
}

/** @param {string} s */
function mermaidEscapeLabel(s) {
  return String(s).replace(/"/g, "'")
}

/**
 * @param {string} graphifyDir
 * @param {string} appDir
 * @param {Array<{ id?: string; path?: string; type?: string }>} nodes
 * @param {Array<{ source: string; target: string; relation?: string }>} links
 * @param {Map<string, string>} idToPath
 * @param {string} generatedAt
 */
function writeGraphStatsMd(
  graphifyDir,
  appRelPath,
  nodes,
  links,
  idToPath,
  generatedAt
) {
  const byType = new Map()
  for (const n of nodes) {
    const t = String(n.type ?? "unknown")
    byType.set(t, (byType.get(t) ?? 0) + 1)
  }
  const byRel = new Map()
  for (const l of links) {
    const r = String(l.relation ?? "unknown")
    byRel.set(r, (byRel.get(r) ?? 0) + 1)
  }

  const outCount = new Map()
  for (const link of links) {
    if (link.relation !== "imports") continue
    const sp = idToPath.get(link.source)
    if (!sp || !/^src\/.*\.(tsx?|jsx?)$/i.test(sp)) continue
    outCount.set(sp, (outCount.get(sp) ?? 0) + 1)
  }
  const topOut = [...outCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  const inCount = new Map()
  for (const link of links) {
    if (link.relation !== "imports") continue
    const tp = idToPath.get(link.target)
    if (!tp || !/^src\/.*\.(tsx?|jsx?)$/i.test(tp)) continue
    inCount.set(tp, (inCount.get(tp) ?? 0) + 1)
  }
  const topIn = [...inCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)

  const lines = [
    `# Thống kê graph — ${appRelPath} (Graphify)`,
    "",
    `> **Sinh tự động:** \`${generatedAt}\` từ \`../snapshot/graph.json\` — giúp AI nắm **quy mô** và **điểm nóng import** mà không mở full graph.`,
    "",
    "## Nodes theo `type`",
    "",
    "| type | Số |",
    "|------|-----|",
  ]
  for (const [t, n] of [...byType.entries()].sort((a, b) =>
    b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])
  )) {
    lines.push(`| \`${t.replace(/`/g, "'")}\` | ${n} |`)
  }
  lines.push("")
  lines.push("## Links theo `relation`")
  lines.push("")
  lines.push("| relation | Số |")
  lines.push("|----------|-----|")
  for (const [r, n] of [...byRel.entries()].sort((a, b) =>
    b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])
  )) {
    lines.push(`| \`${r.replace(/`/g, "'")}\` | ${n} |`)
  }
  lines.push("")
  lines.push("## Top file theo số cạnh `imports` đi ra (out-degree)")
  lines.push("")
  lines.push(
    "Các file `src/...` import nhiều target nhất (thường là module barrel, service lớn, hoặc controller “dày”)."
  )
  lines.push("")
  lines.push("| File | Số cạnh imports |")
  lines.push("|------|-----------------|")
  for (const [path, c] of topOut) {
    lines.push(`| \`${path}\` | ${c} |`)
  }
  if (topOut.length === 0) {
    lines.push("| — | 0 |")
  }
  lines.push("")
  lines.push("## Top file theo số cạnh `imports` đi vào (in-degree)")
  lines.push("")
  lines.push(
    "File được nhiều nguồn import tới (tiện ích dùng chung, entity, type, helper)."
  )
  lines.push("")
  lines.push("| File | Số lần bị import |")
  lines.push("|------|------------------|")
  for (const [path, c] of topIn) {
    lines.push(`| \`${path}\` | ${c} |`)
  }
  if (topIn.length === 0) {
    lines.push("| — | 0 |")
  }
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push(
    `Chạy \`node script-system/graphify/graphify-update.cjs ${appRelPath}\` rồi \`pnpm graphify:ai-summary\` (hoặc \`pnpm graphify:refresh\`).`
  )
  lines.push("")

  writeFileSync(join(graphifyDir, "GRAPH_STATS.md"), lines.join("\n"), "utf8")
}

/**
 * @param {string} appRelPath ví dụ `apps/main/api`
 * @returns {{ folderTreeRel?: string; domainImportsRel?: string; graphStatsRel?: string }}
 */
function writeGraphArtifactsForApp(appRelPath) {
  const graphPath = appGraphJsonPath(appRelPath)
  const markdownDir = appMarkdownDir(appRelPath)
  mkdirSync(markdownDir, { recursive: true })
  if (!existsSync(graphPath)) {
    return {}
  }

  let doc
  try {
    doc = JSON.parse(readFileSync(graphPath, "utf8"))
  } catch {
    return {}
  }
  const nodes = Array.isArray(doc.nodes) ? doc.nodes : []
  const links = Array.isArray(doc.links) ? doc.links : []

  const idToPath = new Map()
  const idToType = new Map()
  for (const n of nodes) {
    if (n.id && typeof n.path === "string") {
      idToPath.set(n.id, normPath(n.path))
      idToType.set(n.id, String(n.type ?? ""))
    }
  }

  const dirPaths = collectDirectoryPathsForTree(nodes, "src")
  const nested = buildNestedFromPaths(dirPaths)
  const treeBody = renderNestedDirTree(nested)
  const generatedAt = new Date().toISOString()
  const folderTreeMd = [
    `# Cây thư mục — ${appRelPath} (Graphify)`,
    "",
    `> **Sinh tự động:** \`${generatedAt}\` từ \`snapshot/graph.json\` (node \`directory\` / \`route-group\` dưới \`src/\`).`,
    "",
    "```text",
    ...(treeBody.length ? treeBody : ["(không có thư mục src/ trong graph)"]),
    "```",
    "",
    "## Làm mới",
    "",
    `Chạy \`node script-system/graphify/graphify-update.cjs ${appRelPath}\` rồi \`pnpm graphify:ai-summary\` (hoặc \`pnpm graphify:refresh\`).`,
    "",
  ].join("\n")

  const folderTreePath = join(markdownDir, "FOLDER_TREE.md")
  writeFileSync(folderTreePath, folderTreeMd, "utf8")

  const out = {
    folderTreeRel: `${appRelPath}/.graphify/markdown/FOLDER_TREE.md`,
  }

  writeGraphStatsMd(markdownDir, appRelPath, nodes, links, idToPath, generatedAt)
  out.graphStatsRel = `${appRelPath}/.graphify/markdown/GRAPH_STATS.md`

  if (!isNestApiApp(appRelPath)) {
    console.log(
      `[graphify-ai-summary] Đã ghi ${folderTreePath} (${dirPaths.length} thư mục) + GRAPH_STATS.md.`
    )
    return out
  }

  /** @type {Map<string, { count: number; examples: string[] }>} */
  const pairMap = new Map()
  for (const link of links) {
    if (link.relation !== "imports") continue
    const sp = idToPath.get(link.source)
    const tp = idToPath.get(link.target)
    if (!sp || !tp) continue
    if (!sp.startsWith("src/") || !tp.startsWith("src/")) continue
    const fromD = domainFromSrcPath(sp)
    const toD = domainFromSrcPath(tp)
    if (!fromD || !toD || fromD === toD) continue
    const key = `${fromD}\t${toD}`
    let row = pairMap.get(key)
    if (!row) {
      row = { count: 0, examples: [] }
      pairMap.set(key, row)
    }
    row.count += 1
    if (row.examples.length < 4) {
      const ex = `${sp.split("/").pop() ?? sp} → ${tp.split("/").pop() ?? tp}`
      if (!row.examples.includes(ex)) row.examples.push(ex)
    }
  }

  const pairs = [...pairMap.entries()]
    .map(([k, v]) => {
      const [fromD, toD] = k.split("\t")
      return { fromD, toD, ...v }
    })
    .sort((a, b) => {
      const c = a.fromD.localeCompare(b.fromD)
      if (c !== 0) return c
      return a.toD.localeCompare(b.toD)
    })

  const domainImportsLines = [
    "# API — phụ thuộc giữa các domain (`src/`)",
    "",
    `> **Sinh tự động:** \`${generatedAt}\` từ \`snapshot/graph.json\` (cạnh \`relation: \"imports\"\`).`,
    "> **Domain** = thư mục cấp một dưới `src/` (ví dụ `posts`, `users`). File trực tiếp trong `src/*.ts` gom vào domain `_root`.",
    "",
    "Ý nghĩa: **domain hàng gọi (import) domain cột** — Nest module/controller/service trong một feature đang dùng code của feature khác hoặc layer dùng chung (`entities`, `common`, …).",
    "",
    "## Bảng phụ thuộc chéo (gộp)",
    "",
    "| Domain gọi | Domain được import | Số cạnh import | Ví dụ (tên file) |",
    "|-------------|---------------------|----------------|------------------|",
  ]

  for (const { fromD, toD, count, examples } of pairs) {
    const exEsc = examples.join("; ").replace(/\|/g, "\\|")
    domainImportsLines.push(
      `| \`${fromD}\` | \`${toD}\` | ${count} | ${exEsc} |`
    )
  }

  if (pairs.length === 0) {
    domainImportsLines.push(
      "| — | — | 0 | (không có cạnh import chéo domain trong graph) |"
    )
  }

  const inboundByTo = new Map()
  for (const p of pairs) {
    if (!inboundByTo.has(p.toD)) inboundByTo.set(p.toD, [])
    inboundByTo.get(p.toD).push({ fromD: p.fromD, count: p.count })
  }
  for (const arr of inboundByTo.values()) {
    arr.sort((a, b) => b.count - a.count)
  }
  const hubs = [...inboundByTo.entries()]
    .map(([toD, arr]) => ({
      toD,
      total: arr.reduce((s, x) => s + x.count, 0),
      nSources: arr.length,
      arr,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 35)

  domainImportsLines.push("")
  domainImportsLines.push(
    "## Domain trung tâm (chiều ngược: ai import vào domain này?)"
  )
  domainImportsLines.push("")
  domainImportsLines.push(
    "Liệt kê domain **đích** (`to`) được nhiều cạnh `imports` nhất; kèm các domain **nguồn** (`from`) nổi bật."
  )
  domainImportsLines.push("")
  for (const h of hubs) {
    const top = h.arr
      .slice(0, 8)
      .map((x) => `\`${x.fromD}\` (${x.count})`)
      .join(", ")
    domainImportsLines.push(
      `- **\`${h.toD}\`**: **${h.total}** cạnh từ **${h.nSources}** domain — ${top}`
    )
  }
  if (hubs.length === 0) {
    domainImportsLines.push("- (không có dữ liệu inbound)")
  }

  const forMermaid = [...pairs].sort((a, b) => b.count - a.count).slice(0, 80)
  const mermaidDomains = new Set()
  for (const p of forMermaid) {
    mermaidDomains.add(p.fromD)
    mermaidDomains.add(p.toD)
  }
  domainImportsLines.push("")
  domainImportsLines.push(
    "## Sơ đồ Mermaid (tối đa 80 cặp domain, ưu tiên cạnh có trọng số lớn)"
  )
  domainImportsLines.push("")
  domainImportsLines.push("```mermaid")
  domainImportsLines.push("flowchart LR")
  for (const d of [...mermaidDomains].sort()) {
    domainImportsLines.push(
      `    ${mermaidDomainId(d)}["${mermaidEscapeLabel(d)}"]`
    )
  }
  for (const p of forMermaid) {
    domainImportsLines.push(
      `    ${mermaidDomainId(p.fromD)} -->|${p.count}| ${mermaidDomainId(p.toD)}`
    )
  }
  domainImportsLines.push("```")

  domainImportsLines.push("")
  domainImportsLines.push("## Ghi chú")
  domainImportsLines.push("")
  domainImportsLines.push(
    "- Chỉ liệt kê import **nội bộ** giữa file dưới `src/` (theo snapshot Graphify). Import package npm có thể không xuất hiện."
  )
  domainImportsLines.push(
    "- Để biết **HTTP route** giữa client và API, xem controller + `SUMMARY_FOR_AI.md` (module map)."
  )
  domainImportsLines.push("")
  domainImportsLines.push("## Làm mới")
  domainImportsLines.push("")
  domainImportsLines.push(
    `Chạy \`node script-system/graphify/graphify-update.cjs ${appRelPath}\` rồi \`pnpm graphify:ai-summary\` (hoặc \`pnpm graphify:refresh\`).`
  )
  domainImportsLines.push("")

  const domainImportsPath = join(markdownDir, "API_DOMAIN_IMPORTS.md")
  writeFileSync(domainImportsPath, domainImportsLines.join("\n"), "utf8")
  out.domainImportsRel = `${appRelPath}/.graphify/markdown/API_DOMAIN_IMPORTS.md`

  console.log(
    `[graphify-ai-summary] Đã ghi ${folderTreePath} (${dirPaths.length} thư mục) + GRAPH_STATS.md + ${domainImportsPath} (${pairs.length} cặp domain).`
  )
  return out
}

/** @param {GraphifyApp} app */
function summarizeApp(app) {
  const ctxPath = appContextPath(app.path)
  const markdownDir = appMarkdownDir(app.path)
  mkdirSync(markdownDir, { recursive: true })
  const outPath = join(markdownDir, "SUMMARY_FOR_AI.md")
  if (!existsSync(ctxPath)) {
    console.warn(`[graphify-ai-summary] Bỏ qua ${app.label}: không có ${ctxPath}`)
    return
  }

  /** @type {{ generatedAt?: string; projectRoot?: string; summary?: Record<string, unknown>; files?: Record<string, Record<string, unknown>> }} */
  const ctx = JSON.parse(readFileSync(ctxPath, "utf8"))
  const summary = ctx.summary ?? {}
  const files = ctx.files ?? {}

  const graphMeta = writeGraphArtifactsForApp(app.path)
  const repoRel = repoRelFromAppMarkdown(app.path)

  const lines = []
  lines.push(`# ${app.label} — tóm tắt cho AI (Graphify)`)
  lines.push("")
  lines.push(
    `> Tự động sinh từ \`../snapshot/context.json\` — **đọc file này trước**; tránh mở toàn bộ JSON snapshot (nhúng source đầy đủ).`
  )
  lines.push("")
  lines.push(`- **projectRoot:** \`${ctx.projectRoot ?? "—"}\``)
  lines.push(`- **context.generatedAt:** ${ctx.generatedAt ?? "—"}`)
  lines.push("")
  lines.push(...linesAppMarkdownToc(app.path))
  lines.push(...linesAppServiceAndHubDocs(app))

  if (graphMeta.folderTreeRel) {
    lines.push("## Bản đồ từ snapshot/graph.json")
    lines.push("")
    lines.push(
      `- **Cây thư mục \`src/\`:** [\`FOLDER_TREE.md\`](FOLDER_TREE.md) (ASCII từ \`../snapshot/graph.json\`).`
    )
    if (graphMeta.graphStatsRel) {
      lines.push(
        `- **Thống kê graph:** [\`GRAPH_STATS.md\`](GRAPH_STATS.md) — quy mô node/link, top file in/out-degree (điểm nóng import).`
      )
    }
    if (graphMeta.domainImportsRel) {
      lines.push(
        `- **Phụ thuộc chéo giữa domain API:** [\`API_DOMAIN_IMPORTS.md\`](API_DOMAIN_IMPORTS.md) — domain \`src/<tên>\` nào import domain nào (cạnh \`imports\` trong graph).`
      )
    }
    lines.push("")
  }

  lines.push("## Thống kê")
  for (const [k, v] of Object.entries(summary)) {
    if (k === "pages" || k === "layouts" || k === "apiRoutes") continue
    lines.push(`- **${k}:** ${typeof v === "object" ? JSON.stringify(v) : v}`)
  }
  lines.push("")

  const listSection = (title, key) => {
    const arr = summary[key]
    if (!Array.isArray(arr) || arr.length === 0) return
    lines.push(`## ${title} (${arr.length})`)
    for (const p of arr) lines.push(`- \`${p}\``)
    lines.push("")
  }
  listSection("Trang (pages)", "pages")
  listSection("Layout", "layouts")
  listSection("API routes", "apiRoutes")

  const paths = Object.keys(files).sort()

  lines.push(...linesAppSystemNooks(app, paths))

  if (isNestApiApp(app)) {
    const modules = paths.filter((p) => p.endsWith(".module.ts"))
    const controllers = paths.filter(
      (p) => p.endsWith(".controller.ts") && !p.includes(".controller.spec.ts")
    )
    const entities = paths.filter(
      (p) => p.startsWith("src/entities/") && p.endsWith(".ts")
    )
    const migrations = paths.filter((p) => p.startsWith("src/migrations/"))
    if (modules.length) {
      lines.push(`## Nest — module (${modules.length})`)
      for (const p of modules) lines.push(`- \`${p}\``)
      lines.push("")
    }
    if (controllers.length) {
      lines.push(`## Nest — controller (${controllers.length})`)
      for (const p of controllers) lines.push(`- \`${p}\``)
      lines.push("")
    }
    if (entities.length) {
      lines.push(`## Entities (${entities.length})`)
      for (const p of entities) lines.push(`- \`${p}\``)
      lines.push("")
    }
    if (migrations.length) {
      lines.push(`## Migrations (${migrations.length})`)
      for (const p of migrations) lines.push(`- \`${p}\``)
      lines.push("")
    }
  }

  lines.push("## Module map (không có nội dung file)")
  lines.push("")
  lines.push("| File | Loại | Client | Exports | Imports |")
  lines.push("|------|------|--------|---------|---------|")

  for (const rel of paths) {
    const f = files[rel]
    const type = String(f.type ?? "—")
    const client = f.client === true ? "yes" : f.client === false ? "no" : "—"
    const exports = Array.isArray(f.exports) ? f.exports.join(", ") : "—"
    const imports = Array.isArray(f.imports) ? f.imports.join(", ") : "—"
    const esc = (s) =>
      String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").slice(0, 200)
    lines.push(
      `| \`${rel}\` | ${type} | ${client} | ${esc(exports)} | ${esc(imports)} |`
    )
  }

  lines.push("## File Markdown trong scope app")
  lines.push("")
  lines.push(
    `Toàn bộ \`.md\` sinh tự động nằm trong **\`${app.path}/.graphify/markdown/\`**; JSON trong **\`../snapshot/\`** — xem mục **Mục lục artefact Graphify** ở đầu file.`
  )
  lines.push("")
  lines.push(
    `- **Chỉ mục monorepo + chủ đề:** [\`${repoRel}.graphify/markdown/SUMMARY_FOR_AI.md\`](${repoRel}.graphify/markdown/SUMMARY_FOR_AI.md).`
  )
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push(
    `- Cập nhật \`snapshot/context.json\` **và** \`snapshot/graph.json\`: \`node script-system/graphify/graphify-update.cjs ${app.path}\`.`
  )
  const graphExtras = isNestApiApp(app)
      ? ", `GRAPH_STATS.md`, `API_DOMAIN_IMPORTS.md`"
      : ", `GRAPH_STATS.md`"
  lines.push(
    `- Sau đó chạy: \`pnpm graphify:ai-summary\` (sinh thêm \`FOLDER_TREE.md\`${graphExtras} khi có graph).`
  )
  lines.push("")

  writeFileSync(outPath, lines.join("\n"), "utf8")
  console.log(`[graphify-ai-summary] Đã ghi ${outPath} (${paths.length} file).`)
}

/** Quét `workspace:*` trong một package.json. @param {string} packageJsonPath */
function readWorkspaceEdgesFromPackageJson(packageJsonPath) {
  if (!existsSync(packageJsonPath)) return []
  let j
  try {
    j = JSON.parse(readFileSync(packageJsonPath, "utf8"))
  } catch {
    return []
  }
  const name = j.name
  if (!name) return []
  const edges = []
  const blocks = [j.dependencies, j.devDependencies, j.peerDependencies]
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue
    for (const [dep, spec] of Object.entries(block)) {
      if (String(spec).startsWith("workspace:")) {
        edges.push({
          from: String(name),
          dep: String(dep),
          spec: String(spec),
        })
      }
    }
  }
  return edges
}

function writePackagesWorkspaceDepsMd() {
  const pkgBase = packagesGraphifyBase()
  mkdirSync(pkgBase, { recursive: true })
  const mdDir = packagesMarkdownDir()
  mkdirSync(mdDir, { recursive: true })
  const outPath = join(mdDir, "WORKSPACE_DEPS.md")
  const generatedAt = new Date().toISOString()

  const pkgRows = []
  const packagesDir = join(root, "packages")
  if (existsSync(packagesDir)) {
    for (const ent of readdirSync(packagesDir, { withFileTypes: true })) {
      if (!ent.isDirectory() || ent.name === ".graphify") continue
      const pj = join(packagesDir, ent.name, "package.json")
      for (const e of readWorkspaceEdgesFromPackageJson(pj)) {
        pkgRows.push({
          ...e,
          location: `packages/${ent.name}/`,
        })
      }
    }
  }
  pkgRows.sort((a, b) =>
    a.from !== b.from
      ? a.from.localeCompare(b.from)
      : a.dep.localeCompare(b.dep)
  )

  const appRows = []
  /** Đường dẫn package.json deployable — từ PRODUCT_LINES (apps/main/api, …). */
  const appPackageJsonPaths = []
  for (const apps of Object.values(PRODUCT_LINES)) {
    for (const entry of Object.values(apps)) {
      if (!entry?.path) continue
      appPackageJsonPaths.push({
        rel: `${entry.path}/`,
        abs: join(root, entry.path, "package.json"),
      })
    }
  }
  for (const { rel, abs } of appPackageJsonPaths) {
    if (!existsSync(abs)) continue
    for (const e of readWorkspaceEdgesFromPackageJson(abs)) {
      appRows.push({
        ...e,
        location: rel,
      })
    }
  }
  appRows.sort((a, b) =>
    a.from !== b.from
      ? a.from.localeCompare(b.from)
      : a.dep.localeCompare(b.dep)
  )

  const lines = [
    "# Phụ thuộc workspace (`workspace:*`)",
    "",
    `> **Sinh tự động:** \`${generatedAt}\` — quét \`package.json\` trong \`packages/*\` và \`apps/*\` (chỉ liên kết nội bộ monorepo).`,
    "",
    "## `packages/*`",
    "",
    "| Package (from) | Phụ thuộc workspace | spec | Thư mục |",
    "|------------------|---------------------|------|---------|",
  ]
  for (const r of pkgRows) {
    const esc = (s) => String(s).replace(/\|/g, "\\|")
    lines.push(
      `| \`${esc(r.from)}\` | \`${esc(r.dep)}\` | \`${esc(r.spec)}\` | \`${r.location}\` |`
    )
  }
  if (pkgRows.length === 0) {
    lines.push("| — | — | — | — |")
  }
  lines.push("")
  lines.push("## `apps/*`")
  lines.push("")
  lines.push("| App (from) | Phụ thuộc workspace | spec | Thư mục |")
  lines.push("|------------|---------------------|------|---------|")
  for (const r of appRows) {
    const esc = (s) => String(s).replace(/\|/g, "\\|")
    lines.push(
      `| \`${esc(r.from)}\` | \`${esc(r.dep)}\` | \`${esc(r.spec)}\` | \`${r.location}\` |`
    )
  }
  if (appRows.length === 0) {
    lines.push("| — | — | — | — |")
  }
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push(
    "Chạy `pnpm graphify:ai-summary` từ root (script quét lại `package.json`)."
  )
  lines.push("")

  writeFileSync(outPath, lines.join("\n"), "utf8")
  console.log(`[graphify-ai-summary] Đã ghi ${outPath}`)
}

/**
 * Nội dung mục “chỉ dẫn theo chủ đề” nhúng vào `.graphify/markdown/SUMMARY_FOR_AI.md`
 * (đường dẫn tương đối từ file đó).
 */
function getMonorepoAiTopicGuideLines() {
  const mainApi = GRAPHIFY_APPS.find((a) => a.pkg === "@api")?.path ?? "apps/main/api"
  const mainBackend =
    GRAPHIFY_APPS.find((a) => a.pkg === "@backend")?.path ?? "apps/main/backend"
  const hubFrontend =
    GRAPHIFY_APPS.find((a) => a.pkg === "@frontend")?.path ??
    "apps/hub-parent/hub-parent-frontend"
  return [
    "Bảng dưới giúp agent mở **đúng file Graphify** trước khi đào `snapshot/context.json` (file nặng).",
    "",
    "| Mục tiêu | Mở đầu tiên | Tiếp theo |",
    "|------------|-------------|-----------|",
    `| Bản đồ monorepo | **File này** (\`SUMMARY_FOR_AI.md\`) | [\`../../packages/.graphify/markdown/SUMMARY_FOR_AI.md\`](../../packages/.graphify/markdown/SUMMARY_FOR_AI.md), [\`../../${mainApi}/.graphify/markdown/SUMMARY_FOR_AI.md\`](../../${mainApi}/.graphify/markdown/SUMMARY_FOR_AI.md) |`,
    "| Ranh giới service / check | [`../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`](../../docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md) | [`../../AGENTS.md`](../../AGENTS.md), `pnpm verify:bounds` |",
    `| Cây \`src/\` một app | [\`../../${hubFrontend}/.graphify/markdown/FOLDER_TREE.md\`](../../${hubFrontend}/.graphify/markdown/FOLDER_TREE.md) (đổi sang app tương ứng) | \`SUMMARY_FOR_AI.md\` cùng app |`,
    `| Quy mô graph, điểm nóng import | [\`../../${mainApi}/.graphify/markdown/GRAPH_STATS.md\`](../../${mainApi}/.graphify/markdown/GRAPH_STATS.md) | \`FOLDER_TREE.md\`, \`snapshot/context.json\` (khi cần) |`,
    `| Domain Nest import lẫn nhau | [\`../../${mainApi}/.graphify/markdown/API_DOMAIN_IMPORTS.md\`](../../${mainApi}/.graphify/markdown/API_DOMAIN_IMPORTS.md) | \`GRAPH_STATS.md\`, bảng controller trong \`SUMMARY\` |`,
    "| Phụ thuộc `workspace:*` | [`../../packages/.graphify/markdown/WORKSPACE_DEPS.md`](../../packages/.graphify/markdown/WORKSPACE_DEPS.md) | [`../../packages/.graphify/README.md`](../../packages/.graphify/README.md), `SUMMARY_FOR_AI.md` packages |",
    `| UX storefront (Next công khai) | [\`../../docs/admin-pattern/FRONTEND_UX.md\`](../../docs/admin-pattern/FRONTEND_UX.md) | [\`../../${hubFrontend}/.graphify/markdown/SUMMARY_FOR_AI.md\`](../../${hubFrontend}/.graphify/markdown/SUMMARY_FOR_AI.md) |`,
    `| Admin Next (dev) | [\`../../${mainBackend}/.graphify/markdown/SUMMARY_FOR_AI.md\`](../../${mainBackend}/.graphify/markdown/SUMMARY_FOR_AI.md) | [\`../../docs/admin-pattern/ADMIN_PAGE_PATTERN.md\`](../../docs/admin-pattern/ADMIN_PAGE_PATTERN.md) |`,
    "| Quy trình agent (đọc thứ tự) | [`../../docs/admin-pattern/AGENTS_GUIDE.md`](../../docs/admin-pattern/AGENTS_GUIDE.md) | [`../../AGENTS.md`](../../AGENTS.md) |",
    "| Kiểm tra ranh giới tự động | [`../../script-system/verify/verify-service-boundaries.mjs`](../../script-system/verify/verify-service-boundaries.mjs) | `pnpm verify:bounds`, ESLint `service-boundaries` |",
    "| Vòng chuẩn hóa → check → graph | [`../README.md`](../README.md) (checklist) | [`../../.cursor/skills/hub-graphify-standardize-loop/SKILL.md`](../../.cursor/skills/hub-graphify-standardize-loop/SKILL.md) |",
    "",
  ]
}

function writePackagesGraphifyReadme() {
  const outDir = join(root, "packages", ".graphify")
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, "README.md")
  const lines = [
    "# Graphify — `packages/*` (workspace)",
    "",
    "Thư mục `packages/.graphify/markdown/` chứa **artefact Markdown sinh tự động** cho AI/agent; `README.md` ở `packages/.graphify/` mô tả layout.",
    "",
    "## File trong thư mục này",
    "",
    "| File | Mục đích |",
    "|------|----------|",
    "| `markdown/SUMMARY_FOR_AI.md` | Bảng package + vai trò (sinh bởi `pnpm graphify:ai-summary`) |",
    "| `markdown/WORKSPACE_DEPS.md` | Cạnh `workspace:*` từ `package.json` của `packages/*` và `apps/*` |",
    "",
    "## Làm mới",
    "",
    "Từ root repo: `pnpm graphify:ai-summary`.",
    "",
    "## Chỉ mục monorepo",
    "",
    "- [`../../.graphify/markdown/SUMMARY_FOR_AI.md`](../../.graphify/markdown/SUMMARY_FOR_AI.md) — bản đồ tổng + mục *Chỉ dẫn theo chủ đề*.",
    "",
  ]
  writeFileSync(outPath, lines.join("\n"), "utf8")
  console.log(`[graphify-ai-summary] Đã ghi ${outPath}`)
}

/** @param {string} relDir ví dụ `packages/query-client` */
function readWorkspacePackage(relDir) {
  const p = join(root, relDir, "package.json")
  if (!existsSync(p)) return null
  try {
    const j = JSON.parse(readFileSync(p, "utf8"))
    if (!j.name) return null
    return { name: String(j.name), path: relDir.replace(/\\/g, "/") }
  } catch {
    return null
  }
}

function writePackagesGraphifySummary() {
  const pkgBase = packagesGraphifyBase()
  mkdirSync(pkgBase, { recursive: true })
  const mdDir = packagesMarkdownDir()
  mkdirSync(mdDir, { recursive: true })
  const outPath = join(mdDir, "SUMMARY_FOR_AI.md")
  const generatedAt = new Date().toISOString()

  const rows = []
  const packagesDir = join(root, "packages")
  if (existsSync(packagesDir)) {
    for (const ent of readdirSync(packagesDir, { withFileTypes: true })) {
      if (!ent.isDirectory() || ent.name === ".graphify") continue
      const info = readWorkspacePackage(join("packages", ent.name))
      if (info) rows.push(info)
    }
  }
  rows.sort((a, b) => a.name.localeCompare(b.name))

  const roleHints = {
    "@workspace/api-client": "SDK HTTP tới `@api`; không import app Nest/Next.",
    "@workspace/eslint-config":
      "ESLint flat + `service-boundaries` (ranh giới import).",
    "@workspace/query-client":
      "`QueryClient` + retry/stale mặc định TanStack Query (dùng chung Next apps).",
    "@workspace/typescript-config": "tsconfig cơ sở cho package/app.",
    "@ui": "Thư viện UI (React); không import `apps/*`.",
    "@thangph2146/lexical-editor":
      "Editor Lexical workspace; tiêu thụ bởi Next apps + có thể tái xuất UI.",
  }

  const lines = []
  lines.push("# `packages/*` — tóm tắt workspace cho AI (Graphify)")
  lines.push("")
  lines.push(
    `> **Sinh tự động:** \`${generatedAt}\` — liệt kê package trong \`packages/\` (không nhúng source).`
  )
  lines.push("")
  lines.push("## Vai trò trong kiến trúc microservice")
  lines.push("")
  lines.push(
    "- Package **không** thay cho `@api`; app Next gọi API qua HTTP + `@workspace/api-client` hoặc `fetch` public."
  )
  lines.push(
    "- **Không import** source `apps/*` từ package (kiểm soát bởi ESLint `sharedTsPackageBoundary`)."
  )
  lines.push("")
  lines.push(`## Package (${rows.length})`)
  lines.push("")
  lines.push("| Package | Thư mục | Ghi chú |")
  lines.push("|---------|----------|---------|")
  for (const r of rows) {
    const hint = roleHints[r.name] ?? "—"
    lines.push(`| \`${r.name}\` | \`${r.path}/\` | ${hint} |`)
  }
  lines.push("")
  lines.push("## File Markdown trong `packages/.graphify/markdown/`")
  lines.push("")
  lines.push(
    "Artefact Graphify cho **workspace packages** nằm dưới `packages/.graphify/markdown/` (tách biệt `apps/*`)."
  )
  lines.push("")
  lines.push("- **`SUMMARY_FOR_AI.md`** — file này.")
  lines.push(
    "- **[`WORKSPACE_DEPS.md`](WORKSPACE_DEPS.md)** — cạnh `workspace:*` (xem mục dưới)."
  )
  lines.push(
    "- **[`../README.md`](../README.md)** — giải thích scope thư mục Graphify packages."
  )
  lines.push("")
  lines.push("## Phụ thuộc workspace (`workspace:*`)")
  lines.push("")
  lines.push(
    "- Bảng **from → dep** cho `packages/*` và `apps/*`: [`WORKSPACE_DEPS.md`](WORKSPACE_DEPS.md)."
  )
  lines.push("")
  lines.push("## Graphify — tóm tắt theo từng app (markdown)")
  lines.push("")
  lines.push(
    "Định vị **runtime** từng dịch vụ (không import chéo source giữa `apps/*`):"
  )
  lines.push("")
  for (const app of GRAPHIFY_APPS) {
    lines.push(
      `- [${app.pkg} — SUMMARY](../../${app.path}/.graphify/markdown/SUMMARY_FOR_AI.md)`
    )
  }
  lines.push("- [Chỉ mục monorepo](../../.graphify/markdown/SUMMARY_FOR_AI.md)")
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push(
    "- Khi thêm/xóa package: chạy lại `pnpm graphify:ai-summary` từ root (script quét lại `packages/`)."
  )
  lines.push("")

  writeFileSync(outPath, lines.join("\n"), "utf8")
  console.log(`[graphify-ai-summary] Đã ghi ${outPath}`)
}

function writeMonorepoRootSummary() {
  const graphifyDir = rootGraphifyBase()
  mkdirSync(graphifyDir, { recursive: true })
  const mdDir = rootMarkdownDir()
  mkdirSync(mdDir, { recursive: true })
  const outPath = join(mdDir, "SUMMARY_FOR_AI.md")
  const generatedAt = new Date().toISOString()

  const appRows = GRAPHIFY_APPS.map((app) => {
    const ctxPath = appContextPath(app.path)
    if (!existsSync(ctxPath)) {
      return { app, ok: false, note: "chưa có snapshot/context.json" }
    }
    try {
      const ctx = JSON.parse(readFileSync(ctxPath, "utf8"))
      const n = Object.keys(ctx.files ?? {}).length
      return {
        app,
        ok: true,
        generatedAt: ctx.generatedAt ?? "—",
        files: n,
        summaryPath: `${app.path}/.graphify/markdown/SUMMARY_FOR_AI.md`,
      }
    } catch {
      return { app, ok: false, note: "context.json lỗi đọc" }
    }
  })

  const lines = []
  lines.push("# Hub parent template — bản đồ monorepo cho AI (Graphify)")
  lines.push("")
  lines.push(
    `> **Sinh tự động:** \`${generatedAt}\` — chỉ mục dẫn đường; chi tiết module nằm ở từng app/package bên dưới.`
  )
  lines.push("")
  lines.push("## Chỉ dẫn theo chủ đề (đọc trước khi mở sâu)")
  lines.push("")
  lines.push(...getMonorepoAiTopicGuideLines())
  lines.push("## Dịch vụ (`apps/*`)")
  lines.push("")
  lines.push("| Package | Vai trò | Graphify |")
  lines.push("|---------|---------|----------|")
  for (const app of GRAPHIFY_APPS) {
    lines.push(
      `| \`${app.pkg}\` | ${app.label.split(" — ")[0]} | \`${app.path}/.graphify/\` (\`markdown/\`, \`snapshot/\`) |`
    )
  }
  lines.push("")
  lines.push("## Ranh giới (microservice)")
  lines.push("")
  lines.push(
    "- **Không** import chéo source giữa các app trong `apps/*` (ví dụ `@frontend` ↔ `@store-sync-frontend`, `@backend` ↔ `@frontend`)."
  )
  lines.push(
    "- Next ↔ API: **HTTP**; SDK chính `@workspace/api-client` (`createStoreSyncSdk`). Public storefront có thể dùng thêm `fetch` trong `lib/public-posts.ts` (envelope JSON)."
  )
  lines.push(
    "- Kiểm tra: `pnpm verify:bounds` + ESLint `packages/eslint-config/service-boundaries.js`."
  )
  lines.push("")
  lines.push("## Ma trận artefact (clean scope)")
  lines.push("")
  lines.push(
    "| Phạm vi | Markdown (AI, `pnpm graphify:ai-summary`) | Snapshot JSON (`node script-system/graphify/graphify-update.cjs`) |"
  )
  lines.push(
    "|----------|---------------------------------------------|----------------------------------------|"
  )
  lines.push(
    "| **Root** `.graphify/` | `.graphify/markdown/SUMMARY_FOR_AI.md` | `.graphify/snapshot/` (tùy chọn, `node script-system/graphify/graphify-update.cjs .`) |"
  )
  lines.push("| **`packages/`** | `packages/.graphify/markdown/*.md` | — |")
  lines.push(
    "| **Mỗi app** `apps/<x>/` | `apps/<x>/.graphify/markdown/*.md` | `apps/<x>/.graphify/snapshot/context.json` + `graph.json` |"
  )
  lines.push("")
  lines.push("## Góc tìm nhanh (nhiệm vụ → đọc gì)")
  lines.push("")
  lines.push("| Nhiệm vụ | Mở trước |")
  lines.push("|----------|----------|")
  lines.push(
    "| Đổi route / page / layout Next | `apps/<app>/.graphify/markdown/SUMMARY` + `FOLDER_TREE` |"
  )
  lines.push(
    "| Đổi module Nest / import domain | `apps/main/api/.../SUMMARY` (hoặc app API deploy) + `API_DOMAIN_IMPORTS` + `GRAPH_STATS` |"
  )
  lines.push(
    "| Thêm/sửa package workspace | `packages/.../SUMMARY` + `WORKSPACE_DEPS` + `verify:bounds` |"
  )
  lines.push(
    "| Chuẩn hóa sau refactor | `.graphify/README.md` (checklist) + skill `hub-graphify-standardize-loop` |"
  )
  lines.push("")
  lines.push("## `packages/*` (chia sẻ workspace)")
  lines.push("")
  lines.push(
    "- Bản tóm riêng: **`packages/.graphify/markdown/SUMMARY_FOR_AI.md`** (cùng script root)."
  )
  lines.push("")
  lines.push("## Trạng thái snapshot Graphify (`snapshot/context.json`)")
  lines.push("")
  lines.push("| App | Files trong context | generatedAt (context) | SUMMARY |")
  lines.push("|-----|--------------------|------------------------|---------|")
  for (const r of appRows) {
    if (!r.ok) {
      lines.push(`| \`${r.app.pkg}\` | — | — | ${r.note} |`)
      continue
    }
    lines.push(
      `| \`${r.app.pkg}\` | ${r.files} | ${r.generatedAt} | [\`${r.summaryPath}\`](${r.summaryPath}) |`
    )
  }
  lines.push("")
  lines.push(
    "## Artefact từ `snapshot/graph.json` / package scan (`pnpm graphify:ai-summary`)"
  )
  lines.push("")
  lines.push(
    "- Mỗi app: **`apps/<app>/.graphify/markdown/FOLDER_TREE.md`**, **`GRAPH_STATS.md`** — cây `src/` + thống kê graph / điểm nóng import."
  )
  lines.push(
    "- **`apps/main/api/.graphify/markdown/API_DOMAIN_IMPORTS.md`** (và app API deploy tương ứng) — domain `src/<tên>/`, inbound, sơ đồ Mermaid."
  )
  lines.push(
    "- **`packages/.graphify/README.md`** — mô tả layout Graphify packages (`markdown/`)."
  )
  lines.push(
    "- **`packages/.graphify/markdown/WORKSPACE_DEPS.md`** — cạnh `workspace:*` giữa package và app."
  )
  lines.push("")
  lines.push("## Quy trình làm mới toàn bộ đồ thị")
  lines.push("")
  lines.push("```bash")
  lines.push(
    "# Từng app (cập nhật snapshot/context.json + snapshot/graph.json)"
  )
  lines.push("pnpm graphify:update")
  lines.push("# hoặc từng app (đường dẫn thật):")
  for (const app of GRAPHIFY_APPS) {
    lines.push(`node script-system/graphify/graphify-update.cjs ${app.path}`)
  }
  lines.push(
    "# (Tùy) snapshot graph cấp monorepo — ít node nếu không scan deep"
  )
  lines.push("# node script-system/graphify/graphify-update.cjs .")
  lines.push("pnpm graphify:ai-summary")
  lines.push("# gộp update + summary: pnpm graphify:refresh")
  lines.push("```")
  lines.push("")
  lines.push("## Đọc thêm")
  lines.push("")
  lines.push("- `docs/admin-pattern/MICROSERVICE_SYSTEM_MAP.md`")
  lines.push("- `docs/admin-pattern/AGENTS_GUIDE.md`")
  lines.push("- `docs/admin-pattern/FRONTEND_UX.md` (storefront / UI)")
  lines.push("- `AGENTS.md` (entry agent)")
  lines.push("")

  writeFileSync(outPath, lines.join("\n"), "utf8")
  console.log(`[graphify-ai-summary] Đã ghi ${outPath}`)

  const legacyNav = join(graphifyDir, "AI_NAVIGATION.md")
  if (existsSync(legacyNav)) {
    try {
      unlinkSync(legacyNav)
      console.log(
        `[graphify-ai-summary] Đã xóa ${legacyNav} (đã gộp vào SUMMARY_FOR_AI.md).`
      )
    } catch {
      /* ignore */
    }
  }
}

/** @param {GraphifyApp} app */
function writeAppGraphifyReadme(app) {
  const base = appGraphifyBase(app.path)
  mkdirSync(base, { recursive: true })
  const outPath = join(base, "README.md")
  const monorepoRel = `${"../".repeat(app.path.split("/").length + 1)}`
  const isApi = isNestApiApp(app)
  const lines = [
    `# Graphify — \`${app.path}\``,
    "",
    `Package **${app.pkg}**. Thư mục \`.graphify/\` giữ **snapshot** (\`snapshot/\`) và **Markdown cho AI** (\`markdown/\`).`,
    "",
    "## File trong thư mục này",
    "",
    "| File / Thư mục | Mục đích |",
    "|----------------|----------|",
    `| \`snapshot/graph.json\` | Đồ thị node/link (\`node script-system/graphify/graphify-update.cjs ${app.path}\`) |`,
    "| `snapshot/context.json` | Snapshot nội dung file để AI hiểu hệ thống |",
    "| `markdown/SUMMARY_FOR_AI.md` | Tóm tắt module (sinh bởi `pnpm graphify:ai-summary`) |",
    "| `markdown/FOLDER_TREE.md` | Cây thư mục `src/` |",
    "| `markdown/GRAPH_STATS.md` | Thống kê graph |",
  ]
  if (isApi) {
    lines.push(
      "| `markdown/API_DOMAIN_IMPORTS.md` | Phụ thuộc chéo domain NestJS |"
    )
  }
  lines.push("| `README.md` | File này (mô tả layout) |")
  lines.push("")
  lines.push("## Làm mới")
  lines.push("")
  lines.push("```bash")
  lines.push(`node script-system/graphify/graphify-update.cjs ${app.path}`)
  lines.push("pnpm graphify:ai-summary")
  lines.push("```")
  lines.push("")
  lines.push("## Liên kết")
  lines.push("")
  lines.push(
    `- [SUMMARY monorepo](${monorepoRel}.graphify/markdown/SUMMARY_FOR_AI.md)`
  )
  lines.push(
    `- [packages SUMMARY](${monorepoRel}packages/.graphify/markdown/SUMMARY_FOR_AI.md)`
  )
  lines.push(`- [AGENTS.md](${monorepoRel}AGENTS.md)`)
  lines.push("")
  writeFileSync(outPath, lines.join("\n"), "utf8")
}

for (const app of GRAPHIFY_APPS) {
  summarizeApp(app)
  writeAppGraphifyReadme(app)
}
writePackagesWorkspaceDepsMd()
writePackagesGraphifySummary()
writePackagesGraphifyReadme()
writeMonorepoRootSummary()

for (const app of GRAPHIFY_APPS) {
  removeLegacyAppGraphifyFiles(app.path)
}
removeLegacyPackagesGraphifyMarkdown()
removeLegacyRootGraphifySummary()
