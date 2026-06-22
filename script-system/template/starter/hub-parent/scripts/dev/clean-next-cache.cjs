/** Xóa .next trước dev. Tắt: HUB_DEV_SKIP_NEXT_CLEAN=1 */
const fs = require("node:fs")
const path = require("node:path")

const ROOT = path.resolve(__dirname, "../..")

function cleanNextDir(appRelPath, options = {}) {
  const silent = options.silent === true
  const rel = appRelPath.replace(/\\/g, "/").replace(/^\.\//, "")
  const nextDir = path.join(ROOT, rel, ".next")
  if (!fs.existsSync(nextDir)) return false
  try {
    fs.rmSync(nextDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
    if (!silent) {
      const { green, dim } = require("./dev-log.cjs")
      console.log(`${dim("clean-next")} ${green(`${rel}/.next`)} ${dim("removed")}`)
    }
    return true
  } catch (err) {
    console.warn(`[clean-next] ${rel}/.next: ${err instanceof Error ? err.message : err}`)
    return false
  }
}

module.exports = { cleanNextDir }
