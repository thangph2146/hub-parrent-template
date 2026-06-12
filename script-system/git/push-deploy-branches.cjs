/**
 * Sync deploy lines → commit (nếu có) → push main + branch deploy (legacy).
 *
 * Template upstream: dùng --legacy-deploy hoặc pnpm push:legacy / push:checkin / push:parent.
 *
 * Usage:
 *   node push-deploy-branches.cjs --only hub-event
 *   node push-deploy-branches.cjs --only hub-event,hub-parent
 *   node push-deploy-branches.cjs --skip-sync --only hub-parent
 */
const fs = require("node:fs")
const path = require("node:path")
const { execFileSync, execSync } = require("node:child_process")

const { ROOT } = require("../lib/paths.cjs")

const LINE_CONFIG = {
  "hub-event": {
    branch: "hub-event",
    sync: "node script-system/sync/sync-checkin.cjs",
    label: "hub-event (pull:checkin)",
  },
  "hub-parent": {
    branch: "hub-parent",
    sync: "node script-system/sync/sync-parent.cjs",
    label: "hub-parent (pull:parent)",
  },
}

function parseArgs(argv) {
  const flags = new Set()
  let only = ["hub-event", "hub-parent"]
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--only" && argv[i + 1]) {
      only = argv[++i].split(",").map((s) => s.trim())
      continue
    }
    if (arg.startsWith("--")) flags.add(arg)
  }
  return {
    dryRun: flags.has("--dry-run"),
    skipSync: flags.has("--skip-sync"),
    only,
  }
}

function run(cmd, { label, dryRunOk = false, dryRun = false } = {}) {
  if (label) console.log(`\n[push:deploy] ${label}\n`)
  if (dryRun && !dryRunOk) {
    console.log(`[push:deploy] dry-run: ${cmd}`)
    return ""
  }
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim()
}

function gitStatusPorcelain(dryRun) {
  return run("git status --porcelain", { dryRunOk: true, dryRun })
}

function currentBranch(dryRun) {
  return run("git rev-parse --abbrev-ref HEAD", { dryRunOk: true, dryRun })
}

function ensureMainBranch(dryRun) {
  const branch = currentBranch(dryRun)
  if (branch !== "main") {
    console.error(
      `[push:deploy] Cần đứng trên branch main (hiện tại: ${branch}).`,
    )
    process.exit(1)
  }
}

function ensureCleanBeforeSync(dryRun) {
  if (gitStatusPorcelain(dryRun)) {
    console.error(
      '[push:deploy] Còn thay đổi chưa commit. Dùng: pnpm push -- "feat: ..."',
    )
    process.exit(1)
  }
}

function runSyncForLines(lines, dryRun) {
  for (const key of lines) {
    const cfg = LINE_CONFIG[key]
    if (!cfg) {
      console.error(`[push:deploy] line không hợp lệ: ${key}`)
      process.exit(1)
    }
    run(cfg.sync, { label: `Sync ${cfg.label}`, dryRun })
  }
}

function commitSyncIfNeeded(lines, dryRun) {
  if (!gitStatusPorcelain(dryRun)) {
    console.log("[push:deploy] Không có thay đổi sau sync.")
    return false
  }
  const msg = `chore(sync): cập nhật deploy ${lines.join(", ")}`
  run("git add -A", { label: "Stage sync", dryRun })
  if (dryRun) {
    console.log(`[push:deploy] dry-run: git commit -m "${msg}"`)
  } else {
    execFileSync("git", ["commit", "-m", msg], { cwd: ROOT, stdio: "inherit" })
  }
  return true
}

function pushMain(dryRun) {
  run("git push origin main", { label: "Push origin main", dryRun })
}

function updateDeployBranches(branches, dryRun) {
  const head = run("git rev-parse HEAD", { dryRunOk: true, dryRun })
  for (const name of branches) {
    run(`git branch -f ${name} ${head}`, {
      label: `Branch ${name} → ${head.slice(0, 7)}`,
      dryRun,
    })
  }
  run(`git push origin ${branches.join(" ")} --force-with-lease`, {
    label: `Push ${branches.join(", ")}`,
    dryRun,
  })
}

const { dryRun, skipSync, only } = parseArgs(process.argv.slice(2))
const branches = only.map((k) => LINE_CONFIG[k]?.branch).filter(Boolean)

console.log(`[push:deploy] lines: ${only.join(", ")}\n`)

ensureMainBranch(dryRun)
ensureCleanBeforeSync(dryRun)

if (!skipSync) runSyncForLines(only, dryRun)
else console.log("[push:deploy] --skip-sync")

if (!skipSync) commitSyncIfNeeded(only, dryRun)

pushMain(dryRun)
if (branches.length) updateDeployBranches(branches, dryRun)

console.log("\n[push:deploy] Hoàn tất (legacy deploy branch).")

module.exports = { LINE_CONFIG, parseArgs }
