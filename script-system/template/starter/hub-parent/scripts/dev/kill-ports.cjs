/** Giải phóng cổng TCP. Usage: node scripts/dev/kill-ports.cjs 3000 3002 */
const { execSync } = require("node:child_process")
const { dim, green, info } = require("./dev-log.cjs")

const IS_WIN = process.platform === "win32"

function killPortUnix(port) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" })
    return 1
  } catch {
    try {
      const out = execSync(`lsof -ti :${port}`, { encoding: "utf8" }).trim()
      const pids = out ? out.split(/\s+/).filter(Boolean) : []
      for (const pid of pids) {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" })
      }
      return pids.length
    } catch {
      return 0
    }
  }
}

function killPortWin(port) {
  try {
    const output = execSync(
      `netstat -ano | findstr "LISTENING" | findstr ":${port} "`,
      { encoding: "utf8", shell: true },
    )
    const pids = [
      ...new Set(
        output
          .split("\n")
          .map((l) => l.trim().split(/\s+/).pop())
          .filter((pid) => pid && pid !== "0" && /^\d+$/.test(pid)),
      ),
    ]
    if (!pids.length) return 0
    for (const pid of pids) {
      execSync(`taskkill /F /PID ${pid}`, { encoding: "utf8", shell: true })
    }
    return pids.length
  } catch {
    return 0
  }
}

/** @param {number[]} ports @param {{ silent?: boolean }} [options] */
function killPorts(ports, options = {}) {
  const silent = options.silent === true
  if (process.env.HUB_DEV_SKIP_PORT_KILL === "1") return 0

  let total = 0
  for (const port of ports) {
    const killed = IS_WIN ? killPortWin(port) : killPortUnix(port)
    total += killed
    if (!silent) {
      info(
        killed > 0
          ? `${dim("kill-ports")} :${port} ${green(`freed ${killed}`)}`
          : `${dim("kill-ports")} :${port} ${dim("free")}`,
      )
    }
  }
  return total
}

if (require.main === module) {
  const ports = process.argv.slice(2).map(Number).filter(Boolean)
  if (!ports.length) {
    console.error("Usage: node scripts/dev/kill-ports.cjs <port> [port...]")
    process.exit(1)
  }
  killPorts(ports, { silent: false })
}

module.exports = { killPorts }
