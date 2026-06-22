/**
 * Downstream → đẩy inheritPaths lên mono-repo-template (upstream) rồi push main.
 *
 * Usage:
 *   pnpm push:template -- "feat(ui): toast báo cáo thao tác"
 *   pnpm push:template -- --dry-run
 *   pnpm push:template -- --skip-check "fix: api accounts"
 *
 * Env: TEMPLATE_REPO_PATH=/path/to/monorepo-template
 * Manifest: templatePush.localPath (mặc định ../monorepo-template)
 */
const { pushTemplateToUpstream } = require("../lib/template-push.cjs")

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
    skipCheck: forward.includes("--skip-check"),
  }
}

const { message, dryRun, skipCheck } = parseArgs(process.argv.slice(2))

console.log("[push:template] downstream → mono-repo-template\n")

pushTemplateToUpstream({ message, dryRun, skipCheck })
