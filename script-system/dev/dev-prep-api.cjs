/**
 * Predev Nest API — port + ensure-dist (nếu có)
 *
 * Usage: node script-system/dev-prep-api.cjs <port>
 */
const { spawnSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")
const { killPorts } = require("./kill-ports.cjs")
const { prepHeader, prepRow, green, dim, stackPrepQuiet } = require("./dev-log.cjs")

const port = Number(process.argv[2])
if (!port) {
  console.error("Usage: node script-system/dev-prep-api.cjs <port>")
  process.exit(1)
}

const skipKill = process.env.HUB_DEV_SKIP_PORT_KILL === "1"
const ensureDist = path.join(process.cwd(), "scripts", "ensure-dist.mjs")

if (!stackPrepQuiet()) {
  prepHeader()
}

if (skipKill) {
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

if (fs.existsSync(ensureDist)) {
  const r = spawnSync(process.execPath, [ensureDist], {
    stdio: stackPrepQuiet() ? "ignore" : "inherit",
    env: process.env,
  })
  if (r.status !== 0) process.exit(r.status ?? 1)
  if (!stackPrepQuiet()) {
    prepRow("dist", dim("ok"))
  }
}

if (!stackPrepQuiet()) {
  console.log("")
}
