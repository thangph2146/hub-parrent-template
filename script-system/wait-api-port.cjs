/**
 * Chờ TCP port API (mặc định 3002) sẵn sàng.
 *
 * CLI: node script-system/wait-api-port.cjs [port]
 * Env: HUB_DEV_API_PORT, WAIT_API_TIMEOUT_MS
 */
const net = require("net")

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: "127.0.0.1" })
    const done = (ok) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(ok)
    }
    socket.once("connect", () => done(true))
    socket.once("error", () => done(false))
    socket.setTimeout(1500, () => done(false))
  })
}

async function waitForApiPort(port, timeoutMs = 120_000) {
  const started = Date.now()
  process.stdout.write(`[wait-api] Đợi API lắng nghe :${port}`)
  while (Date.now() - started < timeoutMs) {
    if (await isPortOpen(port)) {
      process.stdout.write(" — OK\n")
      return
    }
    process.stdout.write(".")
    await sleep(500)
  }
  process.stdout.write("\n")
  throw new Error(
    `API chưa sẵn sàng trên port ${port} sau ${Math.round(timeoutMs / 1000)}s`,
  )
}

module.exports = { waitForApiPort, isPortOpen }

if (require.main === module) {
  const port = Number(
    process.argv[2] || process.env.HUB_DEV_API_PORT || 3002,
  )
  const timeoutMs = Number(process.env.WAIT_API_TIMEOUT_MS || 120_000)

  waitForApiPort(port, timeoutMs)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[wait-api] ${err.message}`)
      process.exit(1)
    })
}
