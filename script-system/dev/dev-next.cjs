/**
 * Dev Next app — chờ API (nếu stack) rồi chạy next dev.
 *
 * Usage: node script-system/dev-next.cjs <port>
 */
const { waitForApiPort } = require("./wait-api-port.cjs")
const { startNextDev } = require("./next-dev.cjs")
const { cleanNextDir } = require("./clean-next-cache.cjs")
const { dim, cyan, pkgLabel, prepRow, green } = require("./dev-log.cjs")
const path = require("path")
const { ROOT } = require("../lib/paths.cjs")

const port = Number(process.argv[2])
if (!port) {
  console.error("Usage: node script-system/dev-next.cjs <port>")
  process.exit(1)
}

async function main() {
  if (process.env.HUB_DEV_WAIT_API === "1" && process.env.WAIT_API_SKIP !== "1") {
    const apiPort = Number(process.env.HUB_DEV_API_PORT || 3002)
    const timeoutMs = Number(process.env.WAIT_API_TIMEOUT_MS || 120_000)
    await waitForApiPort(apiPort, timeoutMs)
  }

  const skipClean =
    process.env.HUB_DEV_SKIP_NEXT_CLEAN === "1" ||
    process.env.HUB_DEV_SKIP_NEXT_CLEAN === "true"
  if (!skipClean) {
    const appRel = path.relative(ROOT, process.cwd()).replace(/\\/g, "/")
    if (appRel && !appRel.startsWith("..")) {
      const removed = cleanNextDir(appRel, { silent: true })
      if (process.env.HUB_DEV_LOG === "verbose") {
        prepRow(".next", removed ? green("removed") : dim("clean"))
      }
    }
  }

  const mode =
    process.env.HUB_DEV_USE_WEBPACK === "1" ? dim("webpack") : dim("turbopack")
  console.log(`${dim("▶")} ${cyan(pkgLabel())} ${dim("·")} next dev ${cyan(`:${port}`)} ${mode}\n`)

  startNextDev(port)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
