/**
 * Bootstrap monorepo downstream (một product line) từ template upstream.
 *
 * Usage:
 *   node script-system/sync/init-downstream.cjs hub-parent ../my-hub-site
 *
 * Sau init: đổi `name` trong package.json → pnpm install → pnpm dev
 */
const fs = require("node:fs")
const path = require("node:path")
const { execFileSync, execSync } = require("node:child_process")

const { ROOT } = require("../lib/monorepo-root.cjs")
const { copyProductStarter } = require("./copy-product-starter.cjs")

const TEMPLATE_DIR = path.join(ROOT, "script-system/template")

function loadUpstreamManifest() {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, "template.manifest.json"), "utf8"),
  )
}

const lineKey = process.argv[2]
const destArg = process.argv[3]

if (!lineKey || !destArg) {
  console.error(
    "Usage: node init-downstream.cjs <hub-checkin|hub-parent|store-sync> <dest-dir>",
  )
  process.exit(1)
}

const upstream = loadUpstreamManifest()
const line = upstream.productLines?.[lineKey]
if (!line) {
  console.error(`[init:downstream] product line không hợp lệ: ${lineKey}`)
  process.exit(1)
}

const destRoot = path.resolve(destArg)
if (fs.existsSync(destRoot) && fs.readdirSync(destRoot).length > 0) {
  console.error(`[init:downstream] Thư mục đích không rỗng: ${destRoot}`)
  process.exit(1)
}

console.log(`[init:downstream] ${lineKey} → ${destRoot}\n`)

fs.mkdirSync(destRoot, { recursive: true })

const workspaceTpl = path.join(TEMPLATE_DIR, `pnpm-workspace.${lineKey}.yaml`)
const packageTpl = path.join(TEMPLATE_DIR, `package.${lineKey}.json`)
const manifestProductLine = line.manifestProductLine ?? lineKey
const manifestTpl = path.join(TEMPLATE_DIR, "template.manifest.downstream.json")
const readmeTpl = path.join(TEMPLATE_DIR, `README.${lineKey}.md`)
const turboTpl = path.join(TEMPLATE_DIR, "turbo.downstream.json")

if (fs.existsSync(workspaceTpl)) {
  fs.copyFileSync(workspaceTpl, path.join(destRoot, "pnpm-workspace.yaml"))
}
if (fs.existsSync(packageTpl)) {
  fs.copyFileSync(packageTpl, path.join(destRoot, "package.json"))
}

const manifest = JSON.parse(fs.readFileSync(manifestTpl, "utf8"))
manifest.id = `${lineKey}-monorepo`
manifest.productLine = manifestProductLine
manifest.defaultRemote = upstream.defaultRemote
if (manifestProductLine === upstream.primaryProductLine) {
  manifest.primary = true
}
fs.writeFileSync(
  path.join(destRoot, "template.manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
)

if (fs.existsSync(readmeTpl)) {
  fs.copyFileSync(readmeTpl, path.join(destRoot, "README.md"))
}

if (fs.existsSync(turboTpl)) {
  fs.copyFileSync(turboTpl, path.join(destRoot, "turbo.json"))
} else if (fs.existsSync(path.join(ROOT, "turbo.json"))) {
  fs.copyFileSync(path.join(ROOT, "turbo.json"), path.join(destRoot, "turbo.json"))
}

fs.copyFileSync(
  path.join(ROOT, ".gitignore"),
  path.join(destRoot, ".gitignore"),
)

console.log("[init:downstream] Copy starter pack (apps + scripts)…")
if (!copyProductStarter(lineKey, destRoot)) {
  console.warn(
    `[init:downstream] Chưa có starter/${lineKey} — thêm apps/scripts thủ công trước khi dev.`,
  )
}

execFileSync("git", ["init"], { cwd: destRoot, stdio: "inherit" })
execFileSync(
  "git",
  ["remote", "add", "template", upstream.defaultRemote],
  { cwd: destRoot, stdio: "inherit" },
)

console.log("\n[init:downstream] pull:template + post-pull…\n")
execFileSync(
  "node",
  [path.join(ROOT, "script-system/sync/pull-template.cjs"), "--full"],
  { cwd: destRoot, stdio: "inherit" },
)

const appRoot = line.appTargets?.root ?? `apps/${lineKey}`
console.log(
  `\n[init:downstream] Hoàn tất.\n` +
    `  cd ${destRoot}\n` +
    `  # 1) Đổi tên: sửa "name" trong package.json\n` +
    `  pnpm install\n` +
    `  pnpm dev\n` +
    `  git remote add origin <repo-sản-phẩm>\n` +
    `\n  App root: ${appRoot}\n`,
)
