/**
 * Bootstrap monorepo downstream (một product line) từ template upstream.
 *
 * Usage:
 *   node script-system/sync/init-downstream.cjs hub-checkin ../hub-checkin-monorepo
 *   node script-system/sync/init-downstream.cjs hub-parent ../hub-parent-monorepo
 */
const fs = require("node:fs")
const path = require("node:path")
const { execFileSync, execSync } = require("node:child_process")

const { ROOT } = require("../lib/monorepo-root.cjs")

const TEMPLATE_DIR = path.join(ROOT, "script-system/template")

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  ".graphify",
])

function copyDir(src, dest, { skipDirs = SKIP_DIRS } = {}) {
  fs.mkdirSync(dest, { recursive: true })
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue
    const from = path.join(src, ent.name)
    const to = path.join(dest, ent.name)
    if (ent.isDirectory()) copyDir(from, to, { skipDirs })
    else fs.copyFileSync(from, to)
  }
}

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

const appsSrc = path.join(ROOT, line.appsPath)
if (!fs.existsSync(appsSrc)) {
  console.error(`[init:downstream] Thiếu ${line.appsPath} trên template`)
  process.exit(1)
}

console.log(`[init:downstream] ${lineKey} → ${destRoot}\n`)

fs.mkdirSync(destRoot, { recursive: true })

const workspaceTpl = path.join(TEMPLATE_DIR, `pnpm-workspace.${lineKey}.yaml`)
const packageTpl = path.join(TEMPLATE_DIR, `package.${lineKey}.json`)
const manifestProductLine = line.manifestProductLine ?? lineKey
const manifestTpl = path.join(TEMPLATE_DIR, "template.manifest.downstream.json")
const readmeTpl = path.join(TEMPLATE_DIR, `README.${lineKey}.md`)

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

const turboSrc = path.join(ROOT, "turbo.json")
if (fs.existsSync(turboSrc)) {
  fs.copyFileSync(turboSrc, path.join(destRoot, "turbo.json"))
}

fs.mkdirSync(path.join(destRoot, "apps"), { recursive: true })
copyDir(appsSrc, path.join(destRoot, line.appsPath))

const ecoDir = path.join(ROOT, "ecosystem")
if (fs.existsSync(ecoDir)) {
  copyDir(ecoDir, path.join(destRoot, "ecosystem"))
}

fs.copyFileSync(
  path.join(ROOT, ".gitignore"),
  path.join(destRoot, ".gitignore"),
)

const appsReadme = path.join(ROOT, "apps/README.md")
if (fs.existsSync(appsReadme)) {
  fs.copyFileSync(appsReadme, path.join(destRoot, "apps/README.md"))
}

execFileSync("git", ["init"], { cwd: destRoot, stdio: "inherit" })
execFileSync(
  "git",
  ["remote", "add", "template", upstream.defaultRemote],
  { cwd: destRoot, stdio: "inherit" },
)

console.log("\n[init:downstream] Chạy pull:template trong repo mới…\n")
execFileSync(
  "node",
  [path.join(ROOT, "script-system/sync/pull-template.cjs")],
  { cwd: destRoot, stdio: "inherit" },
)

console.log(
  `\n[init:downstream] Hoàn tất.\n` +
    `  cd ${destRoot}\n` +
    `  pnpm install\n` +
    `  pnpm check\n` +
    `  git remote add origin <repo-sản-phẩm>\n`,
)
