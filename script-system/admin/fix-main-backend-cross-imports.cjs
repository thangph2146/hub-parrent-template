/**
 * Sau prune admin-app: file native main/backend còn import @/app/{module}/...
 * → trỏ sang @workspace/admin-app/modules/{module}/...
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")

const MAIN_SRC = path.join(ROOT, "apps/main/backend/src")
const CONFIG_PATH = path.join(ROOT, "apps/main/backend/admin.app.config.json")

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(ts|tsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
const modules = config.modules ?? []

let fixed = 0
for (const file of walk(MAIN_SRC)) {
  let content = fs.readFileSync(file, "utf8")
  const original = content
  for (const mod of modules) {
    content = content.replace(
      new RegExp(`@/app/${mod}/`, "g"),
      `@workspace/admin-app/modules/${mod}/`,
    )
  }
  if (content !== original) {
    fs.writeFileSync(file, content)
    fixed++
  }
}

console.log(`[fix-main-backend-cross-imports] updated ${fixed} files`)
