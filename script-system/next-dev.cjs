/**
 * Wrapper `next dev` — stack dev có thể bật webpack thay turbopack (giảm GPU).
 *
 * Usage: node script-system/next-dev.cjs <port>
 * Env:   HUB_DEV_USE_WEBPACK=1 → thêm flag --webpack
 */
const { spawn } = require("child_process")

const port = process.argv[2]
if (!port) {
  console.error("Usage: node script-system/next-dev.cjs <port>")
  process.exit(1)
}

const args = ["dev", "--port", String(port)]
if (process.env.HUB_DEV_USE_WEBPACK === "1") {
  args.push("--webpack")
}

const child = spawn("next", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
})

child.on("exit", (code) => process.exit(code ?? 0))
child.on("error", (err) => {
  console.error("[next-dev]", err.message)
  process.exit(1)
})
