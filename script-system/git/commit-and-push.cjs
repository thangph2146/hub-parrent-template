/**
 * Commit (nếu có thay đổi) + sync deploy + push main + hub-event + hub-parent.
 *
 * Usage:
 *   pnpm push -- "feat: mô tả thay đổi"
 *   pnpm push -m "feat: mô tả thay đổi"
 *   pnpm push -- --skip-sync          # đã sync, chỉ commit + push branch
 *   pnpm push -- --dry-run
 *
 * Không có thay đổi local → bỏ qua commit, vẫn chạy push:deploy (sync + push).
 */
const { execFileSync, execSync } = require("node:child_process")
const path = require("node:path")

const { ROOT } = require("../lib/paths.cjs")

function parseArgs(argv) {
  /** @type {string[]} */
  const forward = []
  /** @type {string[]} */
  const messageParts = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "-m") {
      const next = argv[++i]
      if (!next) {
        console.error("[push] Thiếu nội dung sau -m")
        process.exit(1)
      }
      messageParts.push(next)
      continue
    }
    if (arg.startsWith("-m=")) {
      messageParts.push(arg.slice(3))
      continue
    }
    if (arg.startsWith("-")) {
      forward.push(arg)
      continue
    }
    messageParts.push(arg)
  }

  const message = messageParts.length ? messageParts.join(" ") : null
  return { message, forward }
}

function gitStatusPorcelain() {
  return execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" }).trim()
}

function ensureMainBranch() {
  const branch = execSync("git rev-parse --abbrev-ref HEAD", {
    cwd: ROOT,
    encoding: "utf8",
  }).trim()
  if (branch !== "main") {
    console.error(
      `[push] Cần đứng trên branch main (hiện tại: ${branch}).\n` +
        "  git checkout main",
    )
    process.exit(1)
  }
}

function commitDevChanges(message, dryRun) {
  const status = gitStatusPorcelain()
  if (!status) {
    console.log("[push] Working tree sạch — bỏ qua commit dev.")
    return false
  }
  if (!message) {
    console.error(
      "[push] Còn thay đổi chưa commit — cần message:\n" +
        '  pnpm push -- "feat: mô tả ngắn"\n' +
        '  pnpm push -m "feat: mô tả ngắn"',
    )
    process.exit(1)
  }

  console.log(`\n[push] Commit dev: ${message}\n`)
  if (dryRun) {
    console.log("[push] dry-run: git add -A && git commit")
    return true
  }

  execFileSync("git", ["add", "-A"], { cwd: ROOT, stdio: "inherit" })
  execFileSync("git", ["commit", "-m", message], { cwd: ROOT, stdio: "inherit" })
  return true
}

const argv = process.argv.slice(2)
const { message, forward } = parseArgs(argv)
const dryRun = forward.includes("--dry-run")

console.log("[push] commit + deploy (main, hub-event, hub-parent)\n")

ensureMainBranch()
commitDevChanges(message, dryRun)

const deployScript = path.join(__dirname, "push-deploy-branches.cjs")
const deployArgs = ["node", deployScript, ...forward]

console.log(`[push] → ${deployArgs.slice(1).join(" ")}\n`)

if (dryRun) {
  console.log(`[push] dry-run: ${deployArgs.join(" ")}`)
} else {
  execFileSync(deployArgs[0], deployArgs.slice(1), { cwd: ROOT, stdio: "inherit" })
}
