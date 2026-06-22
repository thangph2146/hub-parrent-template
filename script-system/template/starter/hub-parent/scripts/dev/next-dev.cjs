/** Wrapper `next dev`. Usage: node scripts/dev/next-dev.cjs <port> */
const { spawn } = require("node:child_process")
const path = require("node:path")

function resolveNextBin() {
  try {
    return require.resolve("next/dist/bin/next", { paths: [process.cwd()] })
  } catch {
    return path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next")
  }
}

function startNextDev(port) {
  const args = ["dev", "--port", String(port)]
  if (process.env.HUB_DEV_USE_WEBPACK === "1") args.push("--webpack")
  const child = spawn(process.execPath, [resolveNextBin(), ...args], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  })
  child.on("exit", (code) => process.exit(code ?? 0))
  child.on("error", (err) => {
    console.error("[next-dev]", err.message)
    process.exit(1)
  })
}

module.exports = { startNextDev }
