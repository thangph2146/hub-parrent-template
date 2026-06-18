/**
 * Bước 2 đồng bộ downstream — sau khi pull:template đã checkout packages/ + script-system.
 *
 * Usage (downstream repo):
 *   node script-system/sync/post-pull-downstream.cjs
 *   node script-system/sync/post-pull-downstream.cjs --check   # + pnpm check
 *
 * Flow chuẩn:
 *   upstream: pnpm check && pnpm push -- "feat: ..."
 *   downstream: pnpm sync   (= pull:template + script này)
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const { runStep } = require("../lib/run-step.cjs")
const { resolveProfile } = require("./downstream-sync-profile.cjs")

const PREFIX = "post-pull"
const MANIFEST_PATH = path.join(ROOT, "template.manifest.json")

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[${PREFIX}] Thiếu template.manifest.json tại root repo.`)
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
}

function parseArgs(argv) {
  return { withCheck: argv.includes("--check") }
}

function main() {
  const manifest = loadManifest()
  const { withCheck } = parseArgs(process.argv.slice(2))

  if (manifest.role !== "downstream") {
    console.log(
      `[${PREFIX}] skip — role=${manifest.role ?? "unknown"} (chỉ chạy trên downstream)`,
    )
    return
  }

  const profile = resolveProfile(manifest)
  if (!profile) {
    console.error(
      `[${PREFIX}] Không có profile cho productLine=${manifest.productLine} — bổ sung downstream-sync-profile.cjs`,
    )
    process.exit(1)
  }

  console.log(
    `[${PREFIX}] ${manifest.id ?? "downstream"} · ${profile.label} (productLine=${manifest.productLine})\n`,
  )

  for (const step of profile.steps) {
    runStep(ROOT, step.cmd, step.label, PREFIX)
  }

  if (withCheck) {
    runStep(ROOT, "pnpm check", "verify + lint + typecheck", PREFIX)
  }

  console.log(
    `\n[${PREFIX}] xong — dev: xem package.json (dev:* / pm2:*) · commit apps nếu generate đổi`,
  )
  if (!withCheck) {
    console.log(`[${PREFIX}] gợi ý: pnpm check`)
  }
}

main()
