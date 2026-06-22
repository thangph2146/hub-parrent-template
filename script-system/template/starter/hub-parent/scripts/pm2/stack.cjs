/**
 * PM2 hub-parent — Ubuntu/production.
 *
 * Usage: node scripts/pm2/stack.cjs <start|restart|delete|reload|stop>
 *        pnpm pm2 start
 */
const { execSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")

const ROOT = path.resolve(__dirname, "../..")
const {
  createStack,
  PROCESS_NAMES,
  LEGACY_DELETE_NAMES,
} = require("./apps.cjs")

const JSON_PATH = path.join(ROOT, "scripts/pm2/.ecosystem.json")
const action = process.argv[2]

function usage() {
  console.error(`
PM2 hub-parent — start | restart | delete | reload | stop

  pnpm pm2 <action>
  node scripts/pm2/stack.cjs <action>

Deploy lần đầu:
  pnpm install && pnpm build:prod && pnpm pm2 start
`)
  process.exit(1)
}

const VALID = new Set(["start", "restart", "delete", "reload", "stop"])
if (!action || !VALID.has(action)) usage()

function pm2Running() {
  try {
    const out = execSync("pm2 jlist", { cwd: ROOT, encoding: "utf8" })
    return new Set(JSON.parse(out).map((p) => p.name))
  } catch {
    return new Set()
  }
}

function runPm2(args, { allowMissing = false } = {}) {
  try {
    execSync(`pm2 ${args}`, { stdio: "inherit", cwd: ROOT, shell: true })
  } catch (err) {
    if (!allowMissing) throw err
    console.warn(`[pm2] skip: pm2 ${args}`)
  }
}

function writeEcosystem() {
  fs.mkdirSync(path.dirname(JSON_PATH), { recursive: true })
  fs.writeFileSync(
    JSON_PATH,
    `${JSON.stringify({ apps: createStack() }, null, 2)}\n`,
  )
  return JSON_PATH
}

function deleteAll() {
  const names = [...new Set([...PROCESS_NAMES, ...LEGACY_DELETE_NAMES])]
  const running = pm2Running()
  for (const name of names) {
    if (!running.has(name)) continue
    runPm2(`delete ${name}`, { allowMissing: true })
  }
}

function startFresh() {
  const running = pm2Running()
  const conflict = PROCESS_NAMES.filter((n) => running.has(n))
  if (conflict.length) {
    console.error(`[pm2] đã chạy: ${conflict.join(", ")} — dùng pnpm pm2 restart`)
    process.exit(1)
  }
  runPm2(`start "${writeEcosystem()}"`)
}

switch (action) {
  case "start":
    startFresh()
    break
  case "restart":
    deleteAll()
    runPm2(`start "${writeEcosystem()}"`)
    break
  case "delete":
    deleteAll()
    break
  case "reload":
  case "stop":
    for (const name of PROCESS_NAMES.filter((n) => pm2Running().has(n))) {
      const flag = action === "reload" ? " --update-env" : ""
      runPm2(`${action} ${name}${flag}`, { allowMissing: true })
    }
    break
  default:
    usage()
}
