/**
 * Copy starter pack (apps + scripts + product overrides) vào repo downstream mới.
 *
 * Usage: node script-system/sync/copy-product-starter.cjs hub-parent [destRoot]
 */
const fs = require("node:fs")
const path = require("node:path")

const { ROOT } = require("../lib/monorepo-root.cjs")

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".next",
  ".turbo",
  "coverage",
  ".git",
])

function copyDir(src, dest, { skipDirs = SKIP_DIRS } = {}) {
  if (!fs.existsSync(src)) return false
  fs.mkdirSync(dest, { recursive: true })
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue
    const from = path.join(src, ent.name)
    const to = path.join(dest, ent.name)
    if (ent.isDirectory()) copyDir(from, to, { skipDirs })
    else fs.copyFileSync(from, to)
  }
  return true
}

function copyProductStarter(lineKey, destRoot = ROOT) {
  const starterRoot = path.join(
    ROOT,
    "script-system/template/starter",
    lineKey,
  )
  if (!fs.existsSync(starterRoot)) {
    console.warn(`[copy-product-starter] không có starter cho ${lineKey}`)
    return false
  }

  let copied = false
  for (const rel of ["apps", "scripts", "script-system"]) {
    const src = path.join(starterRoot, rel)
    const dest = path.join(destRoot, rel)
    if (copyDir(src, dest)) {
      console.log(`[copy-product-starter] ${rel}/ ← starter/${lineKey}`)
      copied = true
    }
  }
  return copied
}

const lineKey = process.argv[2]
const destArg = process.argv[3]

if (require.main === module) {
  if (!lineKey) {
    console.error(
      "Usage: node copy-product-starter.cjs <hub-parent|hub-checkin|store-sync> [destRoot]",
    )
    process.exit(1)
  }
  const destRoot = destArg ? path.resolve(destArg) : ROOT
  const ok = copyProductStarter(lineKey, destRoot)
  if (!ok) process.exit(1)
}

module.exports = { copyProductStarter, copyDir }
