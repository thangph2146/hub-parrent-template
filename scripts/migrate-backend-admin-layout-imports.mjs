import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const srcRoot = path.join(root, "apps/backend/src")

const replacements = [
  ['@/components/admin-page-guard"', '@ui/components/admin"'],
  ["@/components/admin-page-guard'", "@ui/components/admin'"],
  ['@/components/admin-shell"', '@ui/components/admin"'],
  ["@/components/admin-shell'", "@ui/components/admin'"],
]

function walk(dir, changed) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(full, changed)
    else if (/\.tsx?$/.test(ent.name)) {
      let s = fs.readFileSync(full, "utf8")
      const orig = s
      for (const [a, b] of replacements) s = s.split(a).join(b)
      if (s !== orig) {
        fs.writeFileSync(full, s)
        changed.push(path.relative(root, full))
      }
    }
  }
}

const changed = []
walk(srcRoot, changed)
console.log(`Updated ${changed.length} files`)
