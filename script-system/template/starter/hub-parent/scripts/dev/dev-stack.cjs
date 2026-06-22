/**
 * Dev stack hub-parent — API :3002 + frontend :3000 qua turbo.
 * ponytail: product-owned, không sync từ template.
 */
const { spawn } = require("node:child_process")
const path = require("node:path")

const ROOT = path.resolve(__dirname, "../..")
const IS_WIN = process.platform === "win32"
const PNPM = IS_WIN ? "pnpm.cmd" : "pnpm"
const APPS = ["@hub-parent/api", "@frontend"]
const API_PORT = 3002

const { stackBanner } = require("./dev-log.cjs")

function spawnPnpm(args) {
  const child = spawn(PNPM, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: IS_WIN,
    env: {
      ...process.env,
      HUB_DEV_WAIT_API: "1",
      HUB_DEV_API_PORT: String(API_PORT),
      HUB_DEV_STACK: "parent",
      HUB_DEV_SKIP_PORT_KILL: "1",
      HUB_DEV_SKIP_NEXT_CLEAN: "1",
      TURBO_NO_UPDATE_NOTIFIER: "1",
    },
  })
  child.on("error", (err) => {
    console.error("[dev-stack]", err.message)
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

stackBanner(APPS)
const filterArgs = APPS.flatMap((name) => ["--filter", name])
const turbo = spawnPnpm([
  "turbo",
  "dev",
  "--concurrency",
  String(APPS.length + 1),
  ...filterArgs,
])

function shutdown(code = 0) {
  killTree(turbo)
  process.exit(code)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))
turbo.on("exit", (code) => shutdown(code ?? 0))
