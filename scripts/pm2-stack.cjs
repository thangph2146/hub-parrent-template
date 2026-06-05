/**
 * PM2 stack helper — ghi ecosystem ra JSON rồi gọi PM2 (tránh lỗi parse .cjs trên một số bản PM2).
 *
 * Usage: node scripts/pm2-stack.cjs <start|reload|restart|stop|delete> <main|checkin>
 */
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const {
  createMainStack,
  createCheckinStack,
} = require("../ecosystem.shared.cjs")

const ROOT = path.join(__dirname, "..")

const STACKS = {
  main: createMainStack,
  checkin: createCheckinStack,
}

/** Tên process cũ / lỗi — chỉ dùng khi delete để dọn sạch server. */
const EXTRA_DELETE_NAMES = {
  main: [
    "hub-main-api",
    "hub-main-backend",
    "hub-main-frontend",
  ],
  checkin: [
    "hub-checkin-api",
    "hub-checkin-backend",
    "hub-checkin-frontend",
  ],
}

const action = process.argv[2]
const stack = process.argv[3]

function usage() {
  console.error(
    "Usage: node scripts/pm2-stack.cjs <start|reload|restart|stop|delete> <main|checkin>",
  )
  process.exit(1)
}

if (!action || !stack || !STACKS[stack]) {
  usage()
}

const validActions = new Set(["start", "reload", "restart", "stop", "delete"])
if (!validActions.has(action)) {
  usage()
}

const apps = STACKS[stack]()
const names = apps.map((app) => app.name)
const jsonPath = path.join(ROOT, `.pm2-ecosystem-${stack}.json`)

function runPm2(args, { allowMissing = false } = {}) {
  try {
    execSync(`pm2 ${args}`, { stdio: "inherit", cwd: ROOT })
  } catch (error) {
    if (!allowMissing) {
      throw error
    }
    console.warn(`[pm2-stack] bỏ qua (không tìm thấy hoặc đã dừng): pm2 ${args}`)
  }
}

function runOnEachName(pm2Action, targetNames, { allowMissing = false } = {}) {
  const envFlag =
    pm2Action === "reload" || pm2Action === "restart" ? " --update-env" : ""

  for (const name of targetNames) {
    runPm2(`${pm2Action} ${name}${envFlag}`, { allowMissing })
  }
}

fs.writeFileSync(jsonPath, `${JSON.stringify({ apps }, null, 2)}\n`)

switch (action) {
  case "start":
    runPm2(`start "${jsonPath}"`)
    break
  case "reload":
  case "restart":
  case "stop":
    runOnEachName(action, names, { allowMissing: true })
    break
  case "delete": {
    const deleteNames = [
      ...new Set([...names, ...(EXTRA_DELETE_NAMES[stack] ?? [])]),
    ]
    runOnEachName("delete", deleteNames, { allowMissing: true })
    break
  }
  default:
    usage()
}
