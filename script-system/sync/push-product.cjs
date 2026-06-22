/**
 * Downstream product repo: commit (nếu có) + push origin main + push template packages.
 *
 * Usage:
 *   pnpm push -- "feat: mô tả"
 *   pnpm push -- --dry-run "feat: ..."
 *   pnpm push -- --skip-template "chỉ push repo product"
 *   pnpm push -- --template-only "chỉ sync mono-repo-template"
 *
 * Bước 1: git push origin main (repo hiện tại — apps + thay đổi local)
 * Bước 2: sync inheritPaths → ../monorepo-template → pnpm check → push main upstream
 */
const { execFileSync } = require("node:child_process")

const {
  loadManifest,
  ensureMainBranch,
  gitStatusPorcelain,
  commitIfDirty,
  pushOriginMain,
  pushTemplateToUpstream,
} = require("../lib/template-push.cjs")
const { ROOT } = require("../lib/monorepo-root.cjs")

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
    dryRun: forward.includes("--dry-run"),
    skipTemplate: forward.includes("--skip-template"),
    templateOnly: forward.includes("--template-only"),
    skipCheck: forward.includes("--skip-check"),
  }
}

function commitProductAll(message, dryRun) {
  if (!gitStatusPorcelain(ROOT)) {
    console.log("[push] Product repo sạch — bỏ qua commit.")
    return false
  }
  if (!message?.trim()) {
    console.error('[push] Cần message: pnpm push -- "feat: ..."')
    process.exit(1)
  }
  console.log(`\n[push] Product commit: ${message.trim()}\n`)
  if (dryRun) return true
  execFileSync("git", ["add", "-A"], { cwd: ROOT, stdio: "inherit" })
  execFileSync("git", ["commit", "-m", message.trim()], {
    cwd: ROOT,
    stdio: "inherit",
  })
  return true
}

const { message, dryRun, skipTemplate, templateOnly, skipCheck } = parseArgs(
  process.argv.slice(2),
)

const manifest = loadManifest()

if (manifest.role !== "downstream") {
  console.error(
    "[push] Script dành cho downstream product repo.\n" +
      "  Upstream template: pnpm push (script-system/git/commit-and-push.cjs)",
  )
  process.exit(1)
}

console.log(`[push] ${manifest.id ?? "downstream"} — product + template\n`)

ensureMainBranch(ROOT, "push")

if (!templateOnly) {
  commitProductAll(message, dryRun)
  pushOriginMain(ROOT, dryRun, "push")
}

if (!skipTemplate) {
  pushTemplateToUpstream({ message, dryRun, skipCheck })
} else {
  console.log("\n[push] --skip-template — bỏ qua mono-repo-template\n")
}

console.log("\n[push] Hoàn tất.\n")
