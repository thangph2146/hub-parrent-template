/**
 * Khởi tạo .env từ .env.example cho một stack hoặc toàn bộ app.
 *
 * Usage:
 *   node script-system/env/init-env.cjs parent
 *   node script-system/env/init-env.cjs checkin
 *   node script-system/env/init-env.cjs all
 *   node script-system/env/init-env.cjs --force parent   # ghi đè .env đã tồn tại
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const { ENV_STACKS, allEnvApps } = require("./manifest.cjs")

const args = process.argv.slice(2)
const force = args.includes("--force")
const stackKey = args.find((a) => !a.startsWith("-")) ?? "all"

function resolveApps(key) {
  if (key === "all") return allEnvApps()
  const stack = ENV_STACKS[key]
  if (!stack) {
    console.error(
      `[env:init] stack không hợp lệ: ${key}\n` +
        `  Hợp lệ: ${Object.keys(ENV_STACKS).join(", ")}, all`,
    )
    process.exit(1)
  }
  return stack.apps
}

let created = 0
let skipped = 0

for (const app of resolveApps(stackKey)) {
  const example = path.join(ROOT, app.path, ".env.example")
  const dest = path.join(ROOT, app.path, ".env")

  if (!fs.existsSync(example)) {
    console.error(`[env:init] thiếu ${app.path}/.env.example`)
    process.exitCode = 1
    continue
  }

  if (fs.existsSync(dest) && !force) {
    console.log(`[env:init] skip (đã có): ${app.path}/.env`)
    skipped++
    continue
  }

  fs.copyFileSync(example, dest)
  console.log(`[env:init] ${force && fs.existsSync(dest) ? "overwrite" : "created"}: ${app.path}/.env`)
  created++
}

console.log(`[env:init] xong — tạo ${created}, bỏ qua ${skipped}`)
if (process.exitCode) process.exit(process.exitCode)
