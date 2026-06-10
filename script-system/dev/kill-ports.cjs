/**
 * Giải phóng cổng TCP (Windows). CLI hoặc import killPorts().
 *
 * Usage: node script-system/kill-ports.cjs 3000 3001
 * Skip:  HUB_DEV_SKIP_PORT_KILL=1
 */
const { execSync } = require("node:child_process")
const { dim, green, info } = require("./dev-log.cjs")

const IS_WIN = process.platform === "win32"

/**
 * @param {number[]} ports
 * @param {{ silent?: boolean }} [options]
 * @returns {number} số process đã kill
 */
function killPorts(ports, options = {}) {
  const silent = options.silent === true

  if (process.env.HUB_DEV_SKIP_PORT_KILL === "1") {
    return 0
  }

  if (!IS_WIN) {
    if (!silent) {
      info("[kill-ports] skip — chỉ hỗ trợ Windows trong repo này")
    }
    return 0
  }

  let total = 0

  for (const port of ports) {
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

      if (pids.length === 0) {
        if (!silent) {
          info(`${dim("kill-ports")} :${port} ${dim("free")}`)
        }
        continue
      }

      for (const pid of pids) {
        execSync(`taskkill /F /PID ${pid}`, { encoding: "utf8", shell: true })
        total += 1
        if (!silent) {
          info(`${dim("kill-ports")} :${port} ${green(`freed PID ${pid}`)}`)
        }
      }
    } catch {
      if (!silent) {
        info(`${dim("kill-ports")} :${port} ${dim("free")}`)
      }
    }
  }

  return total
}

if (require.main === module) {
  const ports = process.argv.slice(2).map(Number).filter(Boolean)
  if (ports.length === 0) {
    console.error("Usage: node script-system/kill-ports.cjs <port> [port...]")
    process.exit(1)
  }
  killPorts(ports, { silent: false })
}

module.exports = { killPorts }
