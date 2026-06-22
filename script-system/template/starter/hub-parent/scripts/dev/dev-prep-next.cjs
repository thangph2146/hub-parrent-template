/** Predev Next — port + clean .next. Usage: node scripts/dev/dev-prep-next.cjs <port> <appRel> */
const { killPorts } = require("./kill-ports.cjs")
const { cleanNextDir } = require("./clean-next-cache.cjs")
const { prepHeader, prepRow, green, dim, stackPrepQuiet } = require("./dev-log.cjs")

const port = Number(process.argv[2])
const appRel = process.argv[3]
if (!port || !appRel) {
  console.error("Usage: node scripts/dev/dev-prep-next.cjs <port> <apps/.../path>")
  process.exit(1)
}

const skipClean =
  process.env.HUB_DEV_SKIP_NEXT_CLEAN === "1" ||
  process.env.HUB_DEV_SKIP_NEXT_CLEAN === "true"

if (!stackPrepQuiet()) prepHeader()
if (process.env.HUB_DEV_SKIP_PORT_KILL === "1") {
  prepRow("port", `${dim(`:${port}`)} ${dim("skip (stack)")}`)
} else {
  const killed = killPorts([port], { silent: true })
  prepRow(
    "port",
    killed > 0
      ? `${green(`:${port}`)} ${dim(`freed ${killed}`)}`
      : `${dim(`:${port}`)} ${dim("free")}`,
  )
}
if (skipClean) prepRow(".next", dim("skip (stack)"))
else prepRow(".next", cleanNextDir(appRel, { silent: true }) ? green("removed") : dim("clean"))
if (!stackPrepQuiet()) console.log("")
