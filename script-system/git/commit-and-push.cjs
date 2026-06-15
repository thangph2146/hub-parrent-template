/**
 * Commit (nếu có) + push.
 *
 * Upstream template: chỉ push main (mặc định).
 * Downstream: chỉ push main.
 * Legacy (cùng repo, branch deploy): --legacy-deploy [--only hub-event]
 *
 * Usage:
 *   pnpm push -- "feat: ..."
 *   pnpm push:legacy -- "feat: ..."
 *   pnpm push -- --legacy-deploy --only hub-event "feat: ..."
 */
const fs = require("node:fs")
const path = require("node:path")
const { execFileSync, execSync } = require("node:child_process")

const { ROOT } = require("../lib/monorepo-root.cjs")

function loadManifest() {
  const p = path.join(ROOT, "template.manifest.json")
  if (!fs.existsSync(p)) return { role: "upstream" }
  return JSON.parse(fs.readFileSync(p, "utf8"))
}

function parseArgs(argv) {
  const forward = []
  const messageParts = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "-m") {
      messageParts.push(argv[++i] ?? "")
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
  return {
    message: messageParts.length ? messageParts.join(" ") : null,
    forward,
  }
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
    console.error(`[push] Cần branch main (hiện tại: ${branch}).`)
    process.exit(1)
  }
}

function commitDevChanges(message, dryRun) {
  if (!gitStatusPorcelain()) {
    console.log("[push] Working tree sạch — bỏ qua commit.")
    return false
  }
  if (!message) {
    console.error('[push] Cần message: pnpm push -- "feat: ..."')
    process.exit(1)
  }
  console.log(`\n[push] Commit: ${message}\n`)
  if (dryRun) return true
  execFileSync("git", ["add", "-A"], { cwd: ROOT, stdio: "inherit" })
  execFileSync("git", ["commit", "-m", message], { cwd: ROOT, stdio: "inherit" })
  return true
}

function pushMainOnly(dryRun) {
  console.log("\n[push] Push origin main (template/downstream)\n")
  if (dryRun) {
    console.log("[push] dry-run: git push origin main")
    return
  }
  execFileSync("git", ["push", "origin", "main"], { cwd: ROOT, stdio: "inherit" })
}

const argv = process.argv.slice(2)
const { message, forward } = parseArgs(argv)
const dryRun = forward.includes("--dry-run")
const legacyDeploy = forward.includes("--legacy-deploy")
const manifest = loadManifest()
const isUpstream = manifest.role === "upstream"

console.log(
  `[push] role=${manifest.role ?? "upstream"}${legacyDeploy ? " legacy-deploy" : ""}\n`,
)

ensureMainBranch()
commitDevChanges(message, dryRun)

if (legacyDeploy || (!isUpstream && forward.includes("--deploy-lines"))) {
  const deployScript = path.join(__dirname, "push-deploy-branches.cjs")
  const deployArgs = ["node", deployScript, ...forward.filter((a) => a !== "--legacy-deploy")]
  if (dryRun) console.log(`[push] dry-run: ${deployArgs.join(" ")}`)
  else execFileSync(deployArgs[0], deployArgs.slice(1), { cwd: ROOT, stdio: "inherit" })
} else if (isUpstream && !legacyDeploy) {
  pushMainOnly(dryRun)
  console.log(
    "\n[push] Template upstream — không sync branch deploy.\n" +
      "  Downstream: pnpm pull:template\n" +
      "  Legacy 1-repo: pnpm push:legacy -- \"...\"",
  )
} else {
  pushMainOnly(dryRun)
}
