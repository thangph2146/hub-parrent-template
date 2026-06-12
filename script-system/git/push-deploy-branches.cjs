/**
 * Sync deploy lines → commit (nếu có) → push main + cập nhật branch hub-event, hub-parent.
 *
 * Workflow:
 *   pnpm push -- "feat: ..."     ← commit + push (khuyến nghị)
 *   pnpm push:deploy             ← đã commit sẵn
 *
 * Usage:
 *   node script-system/git/push-deploy-branches.cjs
 *   node script-system/git/push-deploy-branches.cjs --skip-sync
 *   node script-system/git/push-deploy-branches.cjs --dry-run
 *
 * Branch deploy trỏ cùng commit với main sau sync — server clone -b hub-event / hub-parent.
 */
const { execFileSync, execSync } = require("node:child_process")

const { ROOT } = require("../lib/paths.cjs")

const DEPLOY_BRANCHES = ["hub-event", "hub-parent"]
const SYNC_COMMIT_PREFIX = "chore(sync): cập nhật deploy lines hub-event + hub-parent"

const args = new Set(process.argv.slice(2))
const dryRun = args.has("--dry-run")
const skipSync = args.has("--skip-sync")

function run(cmd, { label, dryRunOk = false } = {}) {
  if (label) console.log(`\n[push:deploy] ${label}\n`)
  if (dryRun && !dryRunOk) {
    console.log(`[push:deploy] dry-run: ${cmd}`)
    return ""
  }
  return execSync(cmd, { cwd: ROOT, encoding: "utf8" }).trim()
}

function gitStatusPorcelain() {
  return run("git status --porcelain", { dryRunOk: true })
}

function currentBranch() {
  return run("git rev-parse --abbrev-ref HEAD", { dryRunOk: true })
}

function ensureMainBranch() {
  const branch = currentBranch()
  if (branch !== "main") {
    console.error(
      `[push:deploy] Cần đứng trên branch main (hiện tại: ${branch}).\n` +
        `  git checkout main`,
    )
    process.exit(1)
  }
}

function ensureCleanBeforeSync() {
  const status = gitStatusPorcelain()
  if (status) {
    console.error(
      "[push:deploy] Còn thay đổi chưa commit. Dùng:\n" +
        '  pnpm push -- "feat: mô tả"\n' +
        "  hoặc commit thủ công rồi pnpm push:deploy\n",
    )
    process.exit(1)
  }
}

function runSync() {
  run("node script-system/sync/sync-checkin.cjs", {
    label: "Sync hub-event (pull:checkin)",
  })
  run("node script-system/sync/sync-parent.cjs", {
    label: "Sync hub-parent (pull:parent)",
  })
}

function commitSyncIfNeeded() {
  const status = gitStatusPorcelain()
  if (!status) {
    console.log("[push:deploy] Không có thay đổi sau sync — bỏ qua commit sync.")
    return false
  }
  run("git add -A", { label: "Stage thay đổi sync" })
  if (dryRun) {
    console.log(`[push:deploy] dry-run: git commit -m "${SYNC_COMMIT_PREFIX}"`)
  } else {
    execFileSync("git", ["commit", "-m", SYNC_COMMIT_PREFIX], {
      cwd: ROOT,
      stdio: "inherit",
    })
  }
  return true
}

function pushMain() {
  run("git push origin main", { label: "Push origin main" })
}

function updateDeployBranches() {
  const head = run("git rev-parse HEAD", { dryRunOk: true })
  for (const name of DEPLOY_BRANCHES) {
    run(`git branch -f ${name} ${head}`, {
      label: `Cập nhật branch ${name} → ${head.slice(0, 7)}`,
    })
  }
  run(`git push origin ${DEPLOY_BRANCHES.join(" ")} --force-with-lease`, {
    label: `Push deploy branches: ${DEPLOY_BRANCHES.join(", ")}`,
  })
}

console.log("[push:deploy] main + hub-event + hub-parent\n")

ensureMainBranch()
ensureCleanBeforeSync()

if (!skipSync) {
  runSync()
  commitSyncIfNeeded()
} else {
  console.log("[push:deploy] --skip-sync: bỏ qua pull:checkin / pull:parent")
}

pushMain()
updateDeployBranches()

console.log("\n[push:deploy] Hoàn tất.")
console.log("  Server check-in:  git pull origin hub-event")
console.log("  Server site chính: git pull origin hub-parent")
