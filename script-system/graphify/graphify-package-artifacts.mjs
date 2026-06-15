/**
 * Graphify per-package — snapshot markdown cho packages/* ưu tiên agent.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { ROOT: root } = require("../lib/monorepo-root.cjs")

import { writeAgentArtifactsForApp } from "./graphify-agent-artifacts.mjs"

/** Package có graphify snapshot đầy đủ (ưu tiên agent). */
export const GRAPHIFY_PACKAGES = [
  {
    path: "packages/ui",
    pkg: "@workspace/ui",
    label: "UI library (@ui)",
    doc: "docs/ui-pattern/README.md",
    verify: ["pnpm check"],
    focus: ["src/components/admin/", "src/components/data-table/", "src/hooks/"],
  },
  {
    path: "packages/admin-app",
    pkg: "@workspace/admin-app",
    label: "Admin CRUD dùng chung",
    doc: "docs/admin-pattern/ADMIN_APP_PACKAGE.md",
    verify: ["pnpm check", "pnpm verify:main-admin"],
    focus: ["src/modules/", "src/lib/", "src/runtime/"],
  },
  {
    path: "packages/api-client",
    pkg: "@workspace/api-client",
    label: "HTTP SDK / types",
    doc: "docs/api-client-pattern/README.md",
    verify: ["pnpm check", "pnpm verify:api-contract"],
    focus: ["src/resources/", "src/realtime/"],
  },
  {
    path: "packages/api-server",
    pkg: "@workspace/api-server",
    label: "Logic API Nest dùng chung",
    doc: "packages/api-server/README.md",
    verify: ["pnpm verify:api-template", "pnpm --filter @workspace/api-server test"],
    focus: [
      "src/modules/",
      "deploy/cli/",
      "deploy/config/",
      "deploy/nest/",
    ],
  },
]

function normPath(p) {
  return String(p).replace(/\\/g, "/")
}

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

function buildNestedFromPaths(paths) {
  /** @type {Record<string, Record<string, unknown>>} */
  const rootObj = {}
  for (const raw of paths) {
    const parts = normPath(raw).split("/").filter(Boolean)
    let cur = rootObj
    for (const seg of parts) {
      if (!cur[seg]) cur[seg] = {}
      cur = cur[seg]
    }
  }
  return rootObj
}

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

function writeGraphStatsMd(graphifyDir, relPath, nodes, links, idToPath, generatedAt) {
  const byType = new Map()
  for (const n of nodes) {
    const t = String(n.type ?? "unknown")
    byType.set(t, (byType.get(t) ?? 0) + 1)
  }
  const inCount = new Map()
  for (const link of links) {
    if (link.relation !== "imports") continue
    const tp = idToPath.get(link.target)
    if (!tp || !/^src\/.*\.(tsx?|jsx?)$/i.test(tp)) continue
    inCount.set(tp, (inCount.get(tp) ?? 0) + 1)
  }
  const topIn = [...inCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)

  const lines = [
    `# Thống kê graph — ${relPath} (Graphify)`,
    "",
    `> **Sinh tự động:** \`${generatedAt}\``,
    "",
    "## Top in-degree",
    "",
    "| File | Importers |",
    "|------|-----------|",
  ]
  for (const [path, c] of topIn) lines.push(`| \`${path}\` | ${c} |`)
  if (!topIn.length) lines.push("| — | 0 |")
  lines.push("")
  lines.push("## Nodes theo type")
  lines.push("")
  for (const [t, n] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`- \`${t}\`: ${n}`)
  }
  lines.push("")

  writeFileSync(join(graphifyDir, "GRAPH_STATS.md"), lines.join("\n"), "utf8")
}

function listChildDirs(absDir) {
  if (!existsSync(absDir)) return []
  return readdirSync(absDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

function packageSpecificSections(meta) {
  const abs = join(root, meta.path)
  const lines = []

  if (meta.path === "packages/admin-app") {
    const modules = listChildDirs(join(abs, "src/modules"))
    lines.push(`## Admin modules (\`${modules.length}\`)`)
    lines.push("")
    for (const m of modules) {
      lines.push(`- \`src/modules/${m}/\``)
    }
    lines.push("")
  }

  if (meta.path === "packages/api-client") {
    const resources = listChildDirs(join(abs, "src/resources"))
    const files = existsSync(join(abs, "src/resources"))
      ? readdirSync(join(abs, "src/resources")).filter((f) => f.endsWith(".ts") && f !== "_shared.ts")
      : []
    lines.push(`## API resources (\`${files.length}\` file)`)
    lines.push("")
    for (const f of files.sort()) lines.push(`- \`src/resources/${f}\``)
    lines.push("")
  }

  if (meta.path === "packages/ui") {
    const adminDirs = listChildDirs(join(abs, "src/components/admin"))
    lines.push("## `@ui/components/admin` (thư mục con)")
    lines.push("")
    for (const d of adminDirs.slice(0, 25)) {
      lines.push(`- \`src/components/admin/${d}/\``)
    }
    if (adminDirs.length > 25) {
      lines.push(`- … và ${adminDirs.length - 25} thư mục khác`)
    }
    lines.push("")
  }

  if (meta.path === "packages/api-server") {
    const top = listChildDirs(join(abs, "src"))
    lines.push("## `src/` top-level")
    lines.push("")
    for (const d of top) lines.push(`- \`src/${d}/\``)
    lines.push("")
  }

  return lines
}

/**
 * @param {{ path: string; pkg: string; label: string; doc: string; verify: string[]; focus: string[] }} meta
 */
function writePackageSummary(meta) {
  const ctxPath = join(root, meta.path, ".graphify", "snapshot", "context.json")
  const mdDir = join(root, meta.path, ".graphify", "markdown")
  mkdirSync(mdDir, { recursive: true })
  const generatedAt = new Date().toISOString()

  /** @type {Record<string, unknown>} */
  let summary = {}
  let ctxGeneratedAt = "—"
  if (existsSync(ctxPath)) {
    try {
      const ctx = JSON.parse(readFileSync(ctxPath, "utf8"))
      summary = ctx.summary ?? {}
      ctxGeneratedAt = ctx.generatedAt ?? "—"
    } catch {
      /* skip */
    }
  }

  const lines = [
    `# ${meta.label} — tóm tắt cho AI (Graphify)`,
    "",
    `> Package \`${meta.pkg}\` · \`${meta.path}/\``,
    "",
    `- **context.generatedAt:** ${ctxGeneratedAt}`,
    `- **summary sinh:** \`${generatedAt}\``,
    "",
    "## Mục lục artefact",
    "",
    "- [`FOLDER_TREE.md`](FOLDER_TREE.md) · [`GRAPH_STATS.md`](GRAPH_STATS.md)",
    "- [`IMPACT_RADIUS.md`](IMPACT_RADIUS.md) · [`ENTRY_POINTS.md`](ENTRY_POINTS.md) · [`PATTERN_CLUSTERS.md`](PATTERN_CLUSTERS.md)",
    "",
    "## Doc & verify",
    "",
    `- **Doc:** [\`${meta.doc}\`](../../../${meta.doc})`,
    `- **Verify:** ${meta.verify.map((v) => `\`${v}\``).join(", ")}`,
    "",
    "## Focus paths (agent)",
    "",
  ]
  for (const f of meta.focus) lines.push(`- \`${meta.path}/${f}\``)
  lines.push("")

  if (summary.totalFiles != null) {
    lines.push("## Thống kê snapshot")
    lines.push("")
    for (const [k, v] of Object.entries(summary)) {
      if (k === "pages" || k === "layouts") continue
      if (Array.isArray(v)) continue
      lines.push(`- **${k}:** ${v}`)
    }
    const pages = summary.pages
    if (Array.isArray(pages) && pages.length) {
      lines.push(`- **pages (module):** ${pages.length} file`)
    }
    lines.push("")
  }

  lines.push(...packageSpecificSections(meta))

  lines.push("## Làm mới")
  lines.push("")
  lines.push("```bash")
  lines.push(`node script-system/graphify/graphify-update.cjs ${meta.path}`)
  lines.push("pnpm graphify:ai-summary")
  lines.push("```")
  lines.push("")

  writeFileSync(join(mdDir, "SUMMARY_FOR_AI.md"), lines.join("\n"), "utf8")
}

/**
 * @param {string} relPath e.g. packages/admin-app
 */
function writePackageGraphFromSnapshot(relPath) {
  const graphPath = join(root, relPath, ".graphify", "snapshot", "graph.json")
  const markdownDir = join(root, relPath, ".graphify", "markdown")
  if (!existsSync(graphPath)) return false

  mkdirSync(markdownDir, { recursive: true })
  let doc
  try {
    doc = JSON.parse(readFileSync(graphPath, "utf8"))
  } catch {
    return false
  }

  const nodes = Array.isArray(doc.nodes) ? doc.nodes : []
  const links = Array.isArray(doc.links) ? doc.links : []
  const idToPath = new Map()
  for (const n of nodes) {
    if (n.id && typeof n.path === "string") idToPath.set(n.id, normPath(n.path))
  }

  const generatedAt = new Date().toISOString()
  const dirPaths = collectDirectoryPathsForTree(nodes, "src")
  const treeBody = renderNestedDirTree(buildNestedFromPaths(dirPaths))
  writeFileSync(
    join(markdownDir, "FOLDER_TREE.md"),
    [
      `# Cây thư mục — ${relPath} (Graphify)`,
      "",
      `> **Sinh tự động:** \`${generatedAt}\``,
      "",
      "```text",
      ...(treeBody.length ? treeBody : ["(không có src/ trong graph)"]),
      "```",
      "",
    ].join("\n"),
    "utf8"
  )

  writeGraphStatsMd(markdownDir, relPath, nodes, links, idToPath, generatedAt)
  writeAgentArtifactsForApp(relPath, nodes, links, idToPath, generatedAt)
  return true
}

function writePackageReadme(meta) {
  const base = join(root, meta.path, ".graphify")
  mkdirSync(base, { recursive: true })
  const lines = [
    `# Graphify — \`${meta.path}\``,
    "",
    `Package **${meta.pkg}**. Snapshot: \`snapshot/\` · Markdown AI: \`markdown/\`.`,
    "",
    "| File | Mục đích |",
    "|------|----------|",
    "| `markdown/SUMMARY_FOR_AI.md` | Tóm tắt package |",
    "| `markdown/FOLDER_TREE.md` | Cây `src/` |",
    "| `markdown/GRAPH_STATS.md` | Thống kê graph |",
    "| `markdown/IMPACT_RADIUS.md` | File shared — ai import |",
    "| `markdown/ENTRY_POINTS.md` | Entry / export chính |",
    "| `markdown/PATTERN_CLUSTERS.md` | Boilerplate lặp |",
    "",
    "## Làm mới",
    "",
    "```bash",
    `node script-system/graphify/graphify-update.cjs ${meta.path}`,
    "pnpm graphify:ai-summary",
    "```",
    "",
    "- [Packages hub](../../.graphify/markdown/PACKAGE_INDEX.md)",
    "",
  ]
  writeFileSync(join(base, "README.md"), lines.join("\n"), "utf8")
}

export function writePackageIndexMd(results) {
  const mdDir = join(root, "packages", ".graphify", "markdown")
  mkdirSync(mdDir, { recursive: true })
  const generatedAt = new Date().toISOString()

  const lines = [
    "# PACKAGE_INDEX — graphify per-package (agent)",
    "",
    `> **Sinh tự động:** \`${generatedAt}\` — package workspace có snapshot \`.graphify/snapshot/\`.`,
    "",
    "| Package | Path | Graphify | Doc |",
    "|---------|------|----------|-----|",
  ]

  for (const meta of GRAPHIFY_PACKAGES) {
    const hasGraph = results.get(meta.path) ? "✓" : "— (chạy graphify-update)"
    const pkgFolder = meta.path.replace(/^packages\//, "")
    lines.push(
      `| \`${meta.pkg}\` | \`${meta.path}/\` | [SUMMARY](../../${pkgFolder}/.graphify/markdown/SUMMARY_FOR_AI.md) ${hasGraph} | [\`${meta.doc}\`](../../../${meta.doc}) |`
    )
  }

  lines.push("")
  lines.push("## Làm mới snapshot package")
  lines.push("")
  lines.push("```bash")
  for (const meta of GRAPHIFY_PACKAGES) {
    lines.push(`node script-system/graphify/graphify-update.cjs ${meta.path}`)
  }
  lines.push("pnpm graphify:ai-summary")
  lines.push("```")
  lines.push("")
  lines.push("Hoặc: `pnpm graphify:update:packages` (nếu có trong root `package.json`).")
  lines.push("")

  writeFileSync(join(mdDir, "PACKAGE_INDEX.md"), lines.join("\n"), "utf8")
  console.log(`[graphify-package-artifacts] Đã ghi ${join(mdDir, "PACKAGE_INDEX.md")}`)
}

export function writeAllPackageGraphifyArtifacts() {
  /** @type {Map<string, boolean>} */
  const results = new Map()

  for (const meta of GRAPHIFY_PACKAGES) {
    const ok = writePackageGraphFromSnapshot(meta.path)
    results.set(meta.path, ok)
    writePackageSummary(meta)
    writePackageReadme(meta)
    if (ok) {
      console.log(
        `[graphify-package-artifacts] Đã ghi markdown graph cho ${meta.path}`
      )
    } else {
      console.warn(
        `[graphify-package-artifacts] ${meta.path}: chưa có snapshot/graph.json — chạy graphify-update`
      )
    }
  }

  writePackageIndexMd(results)
  return results
}
