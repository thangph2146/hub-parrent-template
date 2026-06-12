/**
 * Pull/sync site chính từ main → hub-parent (API full copy).
 *
 * Chạy trước khi push branch deploy hub-parent (cùng repo).
 * Không thay git pull — chạy trên repo dev sau khi đã merge vào main.
 */
const { execSync } = require("node:child_process")

const { ROOT } = require("../lib/paths.cjs")

const run = (cmd, label) => {
  console.log(`\n[sync-parent] ${label}\n`)
  execSync(cmd, { cwd: ROOT, stdio: "inherit" })
}

console.log("[sync-parent] main → hub-parent (API full sync)\n")

run(
  "node script-system/sync/sync-api-from-main.cjs hub-parent",
  "1/2 API từ main (full copy, giữ app.module local)",
)
run(
  "node script-system/verify/verify-api-profile.mjs hub-parent",
  "2/2 verify API profile",
)

console.log("\n[sync-parent] Hoàn tất. Test deploy: pnpm dev:parent")
