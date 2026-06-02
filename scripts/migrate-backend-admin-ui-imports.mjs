/**
 * One-off: chuyển import admin UI từ apps/backend/src/components → @ui.
 * Chạy: node scripts/migrate-backend-admin-ui-imports.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const srcRoot = path.join(repoRoot, "apps/backend/src")

const importReplacements = [
  [
    '@/components/admin-table-row-actions"',
    '@ui/components/admin-table-row-actions"',
  ],
  [
    "@/components/admin-table-row-actions'",
    "@ui/components/admin-table-row-actions'",
  ],
  [
    '@/components/admin-confirm-action-dialog"',
    '@ui/components/admin-confirm-action-dialog"',
  ],
  [
    "@/components/admin-confirm-action-dialog'",
    "@ui/components/admin-confirm-action-dialog'",
  ],
  ["@/components/scroll-to-top", "@ui/components/scroll-to-top"],
]

function jsxPropToObjectLine(line) {
  const trimmed = line.trim()
  const brace = trimmed.match(/^(\w+)=\{([^}]+)\}$/)
  if (brace) {
    const [, key, val] = brace
    return val === key ? `${key},` : `${key}: ${val},`
  }
  const str = trimmed.match(/^(\w+)="([^"]*)"$/)
  if (str) return `${str[1]}: "${str[2]}",`
  const str2 = trimmed.match(/^(\w+)='([^']*)'$/)
  if (str2) return `${str2[1]}: '${str2[2]}',`
  return null
}

function transformPaginationFooter(content) {
  let next = content.replace(
    /import \{ AdminTablePaginationFooter \} from ["']@\/components\/admin-table-pagination-footer["'];?\r?\n/g,
    "",
  )
  next = next.replace(
    /import type \{ AdminTablePaginationFooterProps \} from ["']@\/components\/admin-table-pagination-footer["'];?\r?\n/g,
    "",
  )

  const blockRe =
    /footer=\{\s*<AdminTablePaginationFooter\s+([\s\S]*?)\/>\s*\}/g
  next = next.replace(blockRe, (_, rawProps) => {
    const lines = rawProps
      .split("\n")
      .map(jsxPropToObjectLine)
      .filter(Boolean)
    return `pagination={{\n        ${lines.join("\n        ")}\n      }}`
  })

  return next
}

function walk(dir, changedFiles) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      walk(full, changedFiles)
      continue
    }
    if (!/\.tsx?$/.test(ent.name)) continue
    let content = fs.readFileSync(full, "utf8")
    let original = content
    for (const [from, to] of importReplacements) {
      content = content.split(from).join(to)
    }
    content = transformPaginationFooter(content)
    if (content !== original) {
      fs.writeFileSync(full, content)
      changedFiles.push(path.relative(repoRoot, full))
    }
  }
}

const changed = []
walk(srcRoot, changed)
console.log(`Updated ${changed.length} file(s)`)
for (const f of changed) console.log(`  - ${f}`)
