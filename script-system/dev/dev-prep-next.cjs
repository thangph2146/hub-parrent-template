/**
 * Predev Next app — một lệnh: port + clean .next
 *
 * Usage: node script-system/dev-prep-next.cjs <port> <appRelPath>
 */
const { killPorts } = require("./kill-ports.cjs")
const { cleanNextDir } = require("./clean-next-cache.cjs")
const { prepHeader, prepRow, green, dim, stackPrepQuiet } = require("./dev-log.cjs")

const port = Number(process.argv[2])
const appRel = process.argv[3]

if (!port || !appRel) {
  console.error("Usage: node script-system/dev-prep-next.cjs <port> <apps/.../path>")
  process.exit(1)
}

const skipKill = process.env.HUB_DEV_SKIP_PORT_KILL === "1"
const skipClean =
  process.env.HUB_DEV_SKIP_NEXT_CLEAN === "1" ||
  process.env.HUB_DEV_SKIP_NEXT_CLEAN === "true"

if (!stackPrepQuiet()) {
  prepHeader()
}

if (skipKill) {
  prepRow("port", `${dim(`:${port}`)} ${dim("skip (stack)")}`)
} else {
  const killed = killPorts([port], { silent: true })
  if (killed > 0) {
    prepRow("port", `${green(`:${port}`)} ${dim(`freed ${killed}`)}`)
  } else {
    prepRow("port", `${dim(`:${port}`)} ${dim("free")}`)
  }
}

if (skipClean) {
  prepRow(".next", dim("skip (stack)"))
} else {
  const removed = cleanNextDir(appRel, { silent: true })
  if (removed) {
    prepRow(".next", green("removed"))
  } else {
    prepRow(".next", dim("clean"))
  }
}

if (!stackPrepQuiet()) {
  console.log("")
}
