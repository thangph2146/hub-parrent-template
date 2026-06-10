/**
 * Dev stack qua Turbo — @api nằm trong tasks (TUI), app phụ thuộc API đợi port trước khi bind.
 *
 * Usage: node script-system/dev-stack.cjs <checkin|parent|store>
 */
const { spawn } = require("child_process")
const path = require("path")

const ROOT = path.join(__dirname, "..")
const IS_WIN = process.platform === "win32"
const PNPM = IS_WIN ? "pnpm.cmd" : "pnpm"

/** @type {Record<string, { apiPort: number; apps: string[] }>} */
const STACKS = {
  checkin: {
    apiPort: 3002,
    apps: [
      "@api",
      "@hub-event-checkin-frontend",
      "@backend",
      "@thangph2146/lexical-editor",
    ],
  },
  parent: {
    apiPort: 3002,
    apps: ["@api", "@frontend", "@backend", "@thangph2146/lexical-editor"],
  },
  store: {
    apiPort: 3002,
    apps: ["@api", "@store-sync-frontend", "@backend"],
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

function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) killTree(child)
  process.exit(exitCode)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

const filterArgs = stack.apps.flatMap((name) => ["--filter", name])

console.log(
  `[dev-stack:${stackName}] turbo dev — @api trong tasks; app web đợi port ${stack.apiPort}`,
)
console.log(`[dev-stack:${stackName}] ${stack.apps.join(", ")}`)

const turbo = spawnPnpm(
  ["turbo", "dev", ...filterArgs],
  "turbo",
  {
    HUB_DEV_WAIT_API: "1",
    HUB_DEV_API_PORT: String(stack.apiPort),
  },
)
children.push(turbo)

turbo.on("exit", (code) => shutdown(code ?? 0))
