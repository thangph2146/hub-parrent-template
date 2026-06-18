/**
 * Dev stack qua Turbo — API nằm trong tasks (TUI), app phụ thuộc API đợi port trước khi bind.
 *
 * Usage: node script-system/dev-stack.cjs <checkin|parent|store|main|main-checkin>
 */
const { spawn } = require("child_process")
const path = require("path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")
const { startResourceGuard } = require("./dev-resource-guard.cjs")
const { stackBanner } = require("./dev-log.cjs")
const IS_WIN = process.platform === "win32"
const PNPM = IS_WIN ? "pnpm.cmd" : "pnpm"

/** @type {Record<string, { apiPort: number; apps: string[]; useWebpack?: boolean }>} */
const STACKS = {
  main: {
    apiPort: 3002,
    apps: [
      PRODUCT_LINES.main.api.package,
      PRODUCT_LINES.main.backend.package,
      "@thangph2146/lexical-editor",
    ],
  },
  /** main API + main admin + check-in storefront (không chạy tsup watch — dùng dist đã build) */
  "main-checkin": {
    apiPort: 3002,
    apps: [
      PRODUCT_LINES.main.api.package,
      PRODUCT_LINES.main.backend.package,
      PRODUCT_LINES["hub-checkin"].frontend.package,
    ],
    useWebpack: true,
    resourceGuard: true,
  },
  parent: {
    apiPort: 3002,
    apps: [
      PRODUCT_LINES["hub-parent"].api.package,
      PRODUCT_LINES["hub-parent"].frontend.package,
    ],
  },
  /** hub-event API + check-in UI — không chạy tsup watch lexical (xem predev:checkin + ensure-lexical-built) */
  checkin: {
    apiPort: 3002,
    apps: [
      PRODUCT_LINES["hub-checkin"].api.package,
      PRODUCT_LINES["hub-checkin"].frontend.package,
    ],
    useWebpack: true,
  },
  store: {
    apiPort: 3002,
    apps: [
      PRODUCT_LINES["store-sync"].api.package,
      PRODUCT_LINES["store-sync"].frontend.package,
    ],
  },
}

function spawnPnpm(args, label, extraEnv = {}) {
  const child = spawn(PNPM, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: IS_WIN,
    env: { ...process.env, ...extraEnv },
  })
  child.on("error", (err) => {
    console.error(`[dev-stack] Lỗi khởi động ${label}:`, err.message)
    process.exit(1)
  })
  return child
}

function killTree(child) {
  if (!child?.pid || child.killed) return
  if (IS_WIN) {
    spawn("taskkill", ["/pid", String(child.pid), "/f", "/t"], {
      shell: true,
      stdio: "ignore",
    })
  } else {
    child.kill("SIGTERM")
  }
}

const stackName = process.argv[2]
const stack = stackName ? STACKS[stackName] : null

if (!stack) {
  console.error(`
Usage: node script-system/dev-stack.cjs <stack>

Stacks: ${Object.keys(STACKS).join(", ")}
`)
  process.exit(1)
}

/** @type {import('child_process').ChildProcess[]} */
const children = []
let shuttingDown = false
let stopResourceGuard = () => {}

function shutdown(exitCode = 0, stderrMessage) {
  if (shuttingDown) return
  shuttingDown = true
  stopResourceGuard()
  if (stderrMessage) {
    console.error("\n[dev-stack] ─── Resource guard ───")
    console.error(stderrMessage)
    console.error("[dev-stack] ───────────────────────\n")
  }
  for (const child of children) killTree(child)
  process.exit(exitCode)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

const filterArgs = stack.apps.flatMap((name) => ["--filter", name])

stackBanner(stackName, stack.apps)

const stackEnv = {
  HUB_DEV_WAIT_API: "1",
  HUB_DEV_API_PORT: String(stack.apiPort),
  HUB_DEV_STACK: stackName,
  /** Root predev đã kill port — prep từng app vẫn xóa .next trước next dev */
  HUB_DEV_SKIP_PORT_KILL: "1",
  TURBO_NO_UPDATE_NOTIFIER: "1",
}

if (stack.useWebpack) {
  stackEnv.HUB_DEV_USE_WEBPACK = "1"
}

const resourceGuardOn =
  process.env.HUB_DEV_RESOURCE_GUARD === "1" ||
  (stack.resourceGuard === true && process.env.HUB_DEV_RESOURCE_GUARD !== "0")

if (resourceGuardOn) {
  stopResourceGuard = startResourceGuard({
    stackName: stackName,
    onTrip: (report) => shutdown(2, report.message),
  })
}

// Turbo dev: persistent tasks cần concurrency >= số task + 1 (TUI + workers)
const turboConcurrency = Math.max(stack.apps.length + 1, 4)

const turbo = spawnPnpm(
  ["turbo", "dev", "--concurrency", String(turboConcurrency), ...filterArgs],
  "turbo",
  stackEnv,
)
children.push(turbo)

turbo.on("exit", (code) => shutdown(code ?? 0))

