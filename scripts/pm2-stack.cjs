/**
 * PM2 stack helper — ghi ecosystem ra JSON rồi gọi PM2 (tránh lỗi parse .cjs trên một số bản PM2).
 *
 * Usage: node scripts/pm2-stack.cjs <start|restart|delete|reload|stop> <parent|checkin|store>
 *
 * pnpm shortcuts (package.json):
 *   pnpm pm2:start | pm2:restart | pm2:delete           — stack parent
 *   pnpm pm2:start:checkin | pm2:restart:checkin | ...  — stack checkin
 *   pnpm pm2:start:store | pm2:restart:store | ...      — stack store
 */
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const {
  createParentStack,
  createCheckinStack,
  createStoreStack,
} = require("../ecosystem.shared.cjs")

const ROOT = path.join(__dirname, "..")

const STACKS = {
  parent: createParentStack,
  checkin: createCheckinStack,
  store: createStoreStack,
  /** @deprecated alias — dùng parent */
  main: createParentStack,
}

/** Tên process theo stack. */
const STACK_PROCESS_NAMES = {
  parent: [
    "hub-parent-api",
    "hub-parent-backend",
    "hub-parent-frontend",
  ],
  checkin: [
    "hub-checkin-api",
    "hub-checkin-backend",
    "hub-checkin-frontend",
  ],
  store: [
    "hub-store-api",
    "hub-store-backend",
    "hub-store-frontend",
  ],
  main: [
    "hub-parent-api",
    "hub-parent-backend",
    "hub-parent-frontend",
  ],
}

/** Tên process cũ / lỗi — chỉ dùng khi delete để dọn sạch server. */
const EXTRA_DELETE_NAMES = {
  parent: [
    "hub-main-api",
    "hub-main-backend",
    "hub-main-frontend",
    "ecosystem.main",
    "ecosystem.config",
  ],
  main: [
    "hub-main-api",
    "hub-main-backend",
    "hub-main-frontend",
    "ecosystem.main",
    "ecosystem.config",
  ],
  checkin: ["ecosystem.checkin"],
  store: ["ecosystem.store"],
}

const action = process.argv[2]
const stack = process.argv[3]

function usage() {
  console.error(`
PM2 stack — start | restart | delete (và reload, stop)

  node scripts/pm2-stack.cjs <action> <stack>

  stack: parent | checkin | store

Ví dụ:
  pnpm pm2:start              # start stack parent
  pnpm pm2:restart:store      # restart stack store (delete + start)
  pnpm pm2:delete:checkin     # gỡ stack checkin khỏi PM2
`)
  process.exit(1)
}

if (!action || !stack || !STACKS[stack]) {
  usage()
}

const validActions = new Set([
  "start",
  "restart",
  "delete",
  "reload",
  "stop",
])
if (!validActions.has(action)) {
  usage()
}

const apps = STACKS[stack]()
const names = STACK_PROCESS_NAMES[stack] ?? apps.map((app) => app.name)
const jsonPath = path.join(ROOT, `.pm2-ecosystem-${stack}.json`)

function getPm2ProcessNames() {
  try {
    const out = execSync("pm2 jlist", { cwd: ROOT, encoding: "utf8" })
    const list = JSON.parse(out)
    return new Set(list.map((process) => process.name))
  } catch {
    return new Set()
  }
}

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

function getDeleteNames() {
  return [...new Set([...names, ...(EXTRA_DELETE_NAMES[stack] ?? [])])]
}

function deleteStack({ allowMissing = true } = {}) {
  runOnEachName("delete", getDeleteNames(), { allowMissing })
}

function startStack() {
  const running = getPm2ProcessNames()
  const conflict = names.filter((name) => running.has(name))

  if (conflict.length > 0) {
    console.error(
      `[pm2-stack] stack "${stack}" đã có process: ${conflict.join(", ")}`,
    )
    console.error("Dùng: pnpm pm2:restart hoặc pnpm pm2:delete trước khi start.")
    process.exit(1)
  }

  fs.writeFileSync(jsonPath, `${JSON.stringify({ apps }, null, 2)}\n`)
  runPm2(`start "${jsonPath}"`)
}

function restartStack() {
  console.log(`[pm2-stack] restart stack "${stack}" (delete + start)`)
  deleteStack({ allowMissing: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify({ apps }, null, 2)}\n`)
  runPm2(`start "${jsonPath}"`)
}

switch (action) {
  case "start":
    startStack()
    break
  case "restart":
    restartStack()
    break
  case "delete":
    deleteStack({ allowMissing: true })
    break
  case "reload":
  case "stop":
    runOnEachName(action, names, { allowMissing: true })
    break
  default:
    usage()
}
