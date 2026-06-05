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

function run(command) {
  execSync(command, { stdio: "inherit", cwd: ROOT })
}

fs.writeFileSync(jsonPath, `${JSON.stringify({ apps }, null, 2)}\n`)

switch (action) {
  case "start":
    run(`pm2 start "${jsonPath}"`)
    break
  case "reload":
    run(`pm2 reload ${names.join(" ")} --update-env`)
    break
  case "restart":
    run(`pm2 restart ${names.join(" ")} --update-env`)
    break
  case "stop":
    run(`pm2 stop ${names.join(" ")}`)
    break
  case "delete":
    run(`pm2 delete ${names.join(" ")}`)
    break
  default:
    usage()
}
