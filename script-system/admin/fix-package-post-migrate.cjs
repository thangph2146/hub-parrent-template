const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const { normalizeSyncImports } = require("../sync/lib/normalize-sync-imports.cjs")

const PKG_SRC = path.join(ROOT, "packages/admin-app/src")

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function dedupeApiImports(content) {
  if (!/from ["']\.\/api["']/.test(content)) return content
  let out = content.replace(
    /^import \{ api \} from ["']@workspace\/admin-app\/lib\/api["']\s*\n/gm,
    "",
  )
  if (out !== content) return out
  return content.replace(
    /^import \{ api \} from ["']\.\/api["']\s*\n/gm,
    'import { api } from "@workspace/admin-app/lib/api"\n',
  )
}

function fixProductStorageImport(content) {
  return content.replace(
    /@workspace\/admin-app\/modules\/products\/_component\/product-image-storage/g,
    "@workspace/admin-app/lib/product-image-storage-stub",
  )
}

let fixed = 0
for (const file of walk(PKG_SRC)) {
  let content = fs.readFileSync(file, "utf8")
  const original = content
  content = dedupeApiImports(content)
  content = fixProductStorageImport(content)
  content = normalizeSyncImports(content)
  if (content !== original) {
    fs.writeFileSync(file, content)
    fixed++
  }
}

const nativeUtils = path.join(
  ROOT,
  "apps/hub-checkin/hub-checkin-frontend/src/components/admin/events/utils.ts",
)
if (fs.existsSync(nativeUtils)) {
  let content = fs.readFileSync(nativeUtils, "utf8")
  content = content.replace(
    /from ["']\.\.\/posts\/_component["']/g,
    'from "@workspace/admin-app/modules/posts/_component"',
  )
  fs.writeFileSync(nativeUtils, content)
}

console.log(`[fix-package-post-migrate] updated ${fixed} package files`)
