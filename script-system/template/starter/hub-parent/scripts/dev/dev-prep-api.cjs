/** Predev Nest API — port. Usage: node scripts/dev/dev-prep-api.cjs <port> */
const { killPorts } = require("./kill-ports.cjs")
const { prepHeader, prepRow, green, dim, stackPrepQuiet } = require("./dev-log.cjs")

const port = Number(process.argv[2])
if (!port) {
  console.error("Usage: node scripts/dev/dev-prep-api.cjs <port>")
  process.exit(1)
}

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
if (!stackPrepQuiet()) console.log("")
