/** Chờ TCP port API sẵn sàng. */
const net = require("node:net")
const { dim, green, isQuiet } = require("./dev-log.cjs")

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
  const label = `API :${port}`
  if (!isQuiet()) process.stdout.write(`  ${dim("wait")} ${label}${dim(" …")}`)
  while (Date.now() - started < timeoutMs) {
    if (await isPortOpen(port)) {
      const sec = ((Date.now() - started) / 1000).toFixed(1)
      if (!isQuiet()) {
        process.stdout.write(`\r  ${dim("wait")} ${label}  ${green("ready")} ${dim(`${sec}s`)}\n`)
      }
      return
    }
    await sleep(400)
  }
  if (!isQuiet()) process.stdout.write("\n")
  throw new Error(`API chưa sẵn sàng trên port ${port} sau ${Math.round(timeoutMs / 1000)}s`)
}

module.exports = { waitForApiPort, isPortOpen }
