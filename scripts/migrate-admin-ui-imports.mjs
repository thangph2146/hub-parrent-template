import fs from "node:fs"
import path from "node:path"

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      walk(p, acc)
    } else if (/\.tsx?$/.test(entry.name)) {
      acc.push(p)
    }
  }
  return acc
}

const root = path.join(process.cwd(), "apps/backend/src")
const tableRe =
  /ADMIN_TABLE_ACTIONS_COLUMN_META|AdminTable(?:Crud|Trash|View|Edit|SoftDelete|Purge|Restore|RowActions)/
const confirmRe = /AdminConfirmActionDialog/

for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8")
  if (!content.includes("@ui/components/admin")) continue
  if (!tableRe.test(content) && !confirmRe.test(content)) continue

  const next = content.replace(
    /import\s*\{([^}]+)\}\s*from\s*["']@ui\/components\/admin["'];?/g,
    (_match, inner) => {
      const parts = inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const tableParts = parts.filter((p) => tableRe.test(p))
      const confirmParts = parts.filter((p) => confirmRe.test(p))
      const keep = parts.filter(
        (p) => !tableRe.test(p) && !confirmRe.test(p),
      )

      const lines = []
      if (tableParts.length) {
        lines.push(
          `import { ${tableParts.join(", ")} } from "@/lib/admin-table-row-actions";`,
        )
      }
      if (confirmParts.length) {
        lines.push(
          `import { ${confirmParts.join(", ")} } from "@/lib/admin-confirm-dialog";`,
        )
      }
      if (keep.length) {
        lines.push(
          `import { ${keep.join(", ")} } from "@ui/components/admin";`,
        )
      }
      return lines.join("\n")
    },
  )

  if (next !== content) {
    fs.writeFileSync(file, next)
    console.log("updated", path.relative(process.cwd(), file))
  }
}
