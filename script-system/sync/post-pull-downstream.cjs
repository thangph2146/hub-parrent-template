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
const STALE_SCRIPT_PATHS = [
  "script-system/api",
  "script-system/db",
  "script-system/dev",
  "script-system/env",
  "script-system/git",
  "script-system/graphify",
  "script-system/template",
  "script-system/sync/lib",
  "script-system/sync/products",
  "script-system/sync/apply-sync-to-downstream.cjs",
  ["script-system", "sync", "deprecated"].join("/"),
  "script-system/sync/init-downstream.cjs",
  "script-system/sync/sync-api-from-main.cjs",
  "script-system/sync/sync-checkin-menu-tree.cjs",
  "script-system/sync/sync-checkin-packages.cjs",
  "script-system/sync/sync-parent.cjs",
  "ecosystem",
]

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

function pruneStaleScriptSystem() {
  for (const rel of STALE_SCRIPT_PATHS) {
    const target = path.join(ROOT, rel)
    if (!fs.existsSync(target)) continue
    fs.rmSync(target, { recursive: true, force: true })
    console.log(`[${PREFIX}] pruned stale ${rel}`)
  }
}

function resolveRunnableSteps(profile) {
  const steps = profile.steps ?? []
  const ids = new Set()
  return steps.map((step, index) => {
    if (!step?.id || !step?.name || !step?.cmd) {
      throw new Error(
        `[${PREFIX}] downstream-sync-profile step #${index + 1} thiếu id/name/cmd`,
      )
    }
    if (ids.has(step.id)) {
      throw new Error(`[${PREFIX}] downstream-sync-profile trùng step id=${step.id}`)
    }
    ids.add(step.id)
    return { ...step, index: index + 1, total: steps.length }
  })
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

  pruneStaleScriptSystem()

  const steps = resolveRunnableSteps(profile)
  console.log(
    `[${PREFIX}] pipeline: ${steps.map((step) => step.id).join(" → ")}\n`,
  )

  for (const step of steps) {
    runStep(ROOT, step, PREFIX)
  }

  if (withCheck) {
    runStep(
      ROOT,
      {
        id: "check",
        name: "Verify + lint + typecheck",
        cmd: "pnpm check",
        index: steps.length + 1,
        total: steps.length + 1,
      },
      PREFIX,
    )
  }

  console.log(
    `\n[${PREFIX}] xong — product repo tự kiểm tra app/deploy scripts local nếu có generate đổi`,
  )
  if (!withCheck) {
    console.log(`[${PREFIX}] gợi ý: pnpm check`)
  }
}

main()
