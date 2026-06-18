/**
 * Load BACKEND_ADMIN_MENU_ITEMS — packages-first (downstream không có apps/main).
 */
const path = require("node:path")
const { execFileSync } = require("node:child_process")
const fs = require("node:fs")
const { ROOT } = require("../../lib/monorepo-root.cjs")
const { PRODUCT_LINES } = require("../../lib/monorepo-apps.cjs")

const PACKAGE_EXPORT = path.join(__dirname, "export-admin-menu-items.mts")
const LEGACY_EXPORT = path.join(
  ROOT,
  PRODUCT_LINES.main?.backend?.path ?? "apps/main/backend",
  "scripts/export-menu-items.mts",
)

function resolveTsxCli() {
  const candidates = [
    path.join(ROOT, "node_modules", "tsx", "dist", "cli.mjs"),
    path.join(ROOT, "apps", "hub-checkin", "api", "node_modules", "tsx", "dist", "cli.mjs"),
    path.join(ROOT, "apps", "main", "api", "node_modules", "tsx", "dist", "cli.mjs"),
  ]
  for (const cli of candidates) {
    if (fs.existsSync(cli)) return cli
  }
  throw new Error(
    "[load-admin-menu-items] thiếu tsx — chạy pnpm install (root hoặc @hub-event/api)",
  )
}

function loadAdminMenuItems() {
  const script = fs.existsSync(PACKAGE_EXPORT)
    ? PACKAGE_EXPORT
    : LEGACY_EXPORT
  if (!fs.existsSync(script)) {
    throw new Error(
      `[load-admin-menu-items] thiếu export script: ${script}`,
    )
  }
  const tsxCli = resolveTsxCli()
  const raw = execFileSync(process.execPath, [tsxCli, script], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  })
  return JSON.parse(raw)
}

module.exports = { loadAdminMenuItems }
