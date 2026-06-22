/** Dev Next — chờ API (stack) rồi next dev. Usage: node scripts/dev/dev-next.cjs <port> */
const path = require("node:path")
const { waitForApiPort } = require("./wait-api-port.cjs")
const { startNextDev } = require("./next-dev.cjs")
const { cleanNextDir } = require("./clean-next-cache.cjs")
const { dim, cyan, pkgLabel, prepRow, green } = require("./dev-log.cjs")

const ROOT = path.resolve(__dirname, "../..")
const port = Number(process.argv[2])
if (!port) {
  console.error("Usage: node scripts/dev/dev-next.cjs <port>")
  process.exit(1)
}

async function main() {
  if (process.env.HUB_DEV_WAIT_API === "1" && process.env.WAIT_API_SKIP !== "1") {
    await waitForApiPort(Number(process.env.HUB_DEV_API_PORT || 3002))
  }
  const skipClean =
    process.env.HUB_DEV_SKIP_NEXT_CLEAN === "1" ||
    process.env.HUB_DEV_SKIP_NEXT_CLEAN === "true"
  if (!skipClean) {
    const appRel = path.relative(ROOT, process.cwd()).replace(/\\/g, "/")
    if (appRel && !appRel.startsWith("..")) cleanNextDir(appRel, { silent: true })
  }
  console.log(`${dim("▶")} ${cyan(pkgLabel())} ${dim("·")} next dev ${cyan(`:${port}`)}\n`)
  startNextDev(port)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
