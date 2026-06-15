/**
 * Build @thangph2146/lexical-editor một lần nếu dist chưa có (tránh tsup --watch + 2 Next dev).
 */
const { existsSync } = require("node:fs")
const { join } = require("node:path")
const { execSync } = require("node:child_process")

const { ROOT } = require("../lib/monorepo-root.cjs")
const distEntry = join(ROOT, "packages/editor/dist/index.js")

if (existsSync(distEntry)) {
  console.log("[ensure-lexical-built] dist đã có — bỏ qua build")
  process.exit(0)
}

console.log("[ensure-lexical-built] dist thiếu — build @thangph2146/lexical-editor…")
execSync("pnpm --filter @thangph2146/lexical-editor run build", {
  cwd: ROOT,
  stdio: "inherit",
  shell: process.platform === "win32",
})
