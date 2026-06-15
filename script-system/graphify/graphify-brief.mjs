/**
 * Brief định vị task cho agent — đọc TASK_INDEX + keyword match.
 *
 * Usage:
 *   pnpm graphify:brief --task "thêm filter admin screens"
 *   node script-system/graphify/graphify-brief.mjs --task "sửa API events"
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { ROOT: root } = require("../lib/monorepo-root.cjs")

import {
  buildTaskCatalog,
  matchTaskToBrief,
  writeTaskIndexArtifacts,
} from "./graphify-task-index.mjs"

function parseArgs(argv) {
  let task = ""
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--task" && argv[i + 1]) {
      task = argv[++i]
    } else if (!task && !argv[i].startsWith("-")) {
      task = argv[i]
    }
  }
  return { task: task.trim() }
}

function loadCatalog() {
  const jsonPath = join(root, ".graphify", "markdown", "task-index.json")
  if (existsSync(jsonPath)) {
    try {
      return JSON.parse(readFileSync(jsonPath, "utf8"))
    } catch {
      /* rebuild */
    }
  }
  return writeTaskIndexArtifacts().catalog
}

function formatBrief(brief) {
  const out = []
  out.push("=== Graphify brief (agent) ===")
  out.push("")
  out.push(`Task: ${brief.task}`)
  out.push(`Product line: ${brief.productLine}`)
  if (brief.match) {
    out.push(`Match: ${brief.match.type} \`${brief.match.id}\` (score ${brief.match.score})`)
  } else {
    out.push("Match: (không khớp module — đọc AGENTS.md mục 3 thủ công)")
  }
  if (brief.alternates?.length) {
    out.push(`Gợi ý khác: ${brief.alternates.map((id) => `\`${id}\``).join(", ")}`)
  }
  out.push("")
  out.push("Đọc trước:")
  for (const r of brief.reads) out.push(`  - ${r}`)
  out.push("")
  out.push("File/folder ưu tiên:")
  if (brief.files.length) {
    for (const f of brief.files) out.push(`  - ${f}`)
  } else {
    out.push("  - (mở TASK_INDEX.md hoặc AGENTS.md mục 3)")
  }
  out.push("")
  out.push("Graphify (nếu cần sâu):")
  for (const g of brief.graphify) out.push(`  - ${g}`)
  out.push("")
  out.push("Verify sau sửa:")
  for (const v of brief.verify) out.push(`  - ${v}`)
  if (brief.sync) {
    out.push("")
    out.push(`Sync: ${brief.sync}`)
  }
  out.push("")
  out.push("Definition of Done: pnpm check pass + artefact graphify còn mới nếu đổi cấu trúc.")
  out.push("")
  return out.join("\n")
}

const { task } = parseArgs(process.argv)
if (!task) {
  console.error(
    "Usage: pnpm graphify:brief --task \"mô tả task\"\n       node script-system/graphify/graphify-brief.mjs --task \"...\""
  )
  process.exit(1)
}

const catalog = loadCatalog()
const brief = matchTaskToBrief(catalog, task)
console.log(formatBrief(brief))
