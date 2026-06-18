/**
 * Áp dụng sync core từ template upstream sang repo downstream local (dev only).
 * Sau khi push template, downstream dùng `pnpm pull:template` thay vì script này.
 *
 * Usage (từ mono-repo-template):
 *   node script-system/sync/apply-sync-to-downstream.cjs hub-checkin ../hub-checkin-monorepo
 *   node script-system/sync/apply-sync-to-downstream.cjs hub-parent ../hub-parent-monorepo
 *   node script-system/sync/apply-sync-to-downstream.cjs store-sync ../store-sync-monorepo
 */
const fs = require("node:fs")
const path = require("node:path")

const { ROOT } = require("../lib/monorepo-root.cjs")

const TEMPLATE_DIR = path.join(ROOT, "script-system/template")

const SYNC_FILES = [
  "script-system/sync/downstream-sync-profile.cjs",
  "script-system/sync/post-pull-downstream.cjs",
  "script-system/sync/pull-template.cjs",
  "script-system/verify/verify-downstream-safe-flow.cjs",
  "script-system/verify/verify-script-system.cjs",
]

const CHECKIN_EXTRA = [
  "script-system/sync/lib/export-admin-menu-items.mts",
  "script-system/sync/lib/load-admin-menu-items.cjs",
  "script-system/sync/sync-checkin-menu-tree.cjs",
  "script-system/sync/sync-checkin-packages.cjs",
  "script-system/verify/verify-checkin-admin-sync.cjs",
  "script-system/lib/monorepo-apps.cjs",
  "script-system/dev/dev-stack.cjs",
  "script-system/env/api-env-profiles.cjs",
  "script-system/env/manifest.cjs",
  "script-system/api/audit-api-module-parity.cjs",
  "script-system/db/bootstrap-fresh-api.cjs",
  "script-system/verify/verify-data-layout.cjs",
]

const lineKey = process.argv[2]
const destArg = process.argv[3]

if (!lineKey || !destArg) {
  console.error(
    "Usage: node apply-sync-to-downstream.cjs <hub-checkin|hub-event|hub-parent|store-sync> <dest-dir>",
  )
  process.exit(1)
}

const destRoot = path.resolve(destArg)
if (!fs.existsSync(destRoot)) {
  console.error(`[apply-sync] Không tìm thấy: ${destRoot}`)
  process.exit(1)
}

const packageTpl = path.join(TEMPLATE_DIR, `package.${lineKey}.json`)
const readmeTpl = path.join(TEMPLATE_DIR, `README.${lineKey}.json`)
const readmeMdTpl = path.join(TEMPLATE_DIR, `README.${lineKey}.md`)

console.log(`[apply-sync] ${lineKey} → ${destRoot}\n`)

const files = [...SYNC_FILES]
if (lineKey === "hub-checkin" || lineKey === "hub-event") {
  files.push(...CHECKIN_EXTRA)
}

for (const rel of files) {
  const from = path.join(ROOT, rel)
  const to = path.join(destRoot, rel)
  if (!fs.existsSync(from)) {
    console.warn(`[apply-sync] skip missing: ${rel}`)
    continue
  }
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to)
  console.log(`[apply-sync] copied ${rel}`)
}

if (fs.existsSync(packageTpl)) {
  fs.copyFileSync(packageTpl, path.join(destRoot, "package.json"))
  console.log("[apply-sync] copied package.json")
}

const readmeSrc = fs.existsSync(readmeMdTpl)
  ? readmeMdTpl
  : fs.existsSync(readmeTpl)
    ? readmeTpl
    : null
if (readmeSrc) {
  fs.copyFileSync(readmeSrc, path.join(destRoot, "README.md"))
  console.log("[apply-sync] copied README.md")
}

console.log("\n[apply-sync] xong — trên downstream chạy: pnpm post-pull:downstream")
