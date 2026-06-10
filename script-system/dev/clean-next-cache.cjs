/**
 * Xóa thư mục .next trước khi chạy next dev — tránh cache dev lỗi thời.
 *
 * Usage:
 *   node script-system/clean-next-cache.cjs                    # tất cả Next app
 *   node script-system/clean-next-cache.cjs apps/main/backend # một app
 *   node script-system/clean-next-cache.cjs --stack checkin    # theo dev stack
 *
 * Tắt: HUB_DEV_SKIP_NEXT_CLEAN=1
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/paths.cjs")
const { NEXT_APP_PATHS, PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")

/** @type {Record<string, string[]>} */
const STACK_NEXT_PATHS = {
  main: [PRODUCT_LINES.main.backend.path],
  "main-checkin": [
    PRODUCT_LINES.main.backend.path,
    PRODUCT_LINES["hub-event"].frontend.path,
  ],
  parent: [
    PRODUCT_LINES.main.backend.path,
    PRODUCT_LINES["hub-parent"].frontend.path,
  ],
  checkin: [PRODUCT_LINES["hub-event"].frontend.path],
  store: [PRODUCT_LINES["store-sync"].frontend.path],
}

function normRel(rel) {
  return rel.replace(/\\/g, "/").replace(/^\.\//, "")
}

/**
 * @param {string} appRelPath
 * @param {{ silent?: boolean }} [options]
 * @returns {boolean} true nếu đã xóa .next
 */
function cleanNextDir(appRelPath, options = {}) {
  const silent = options.silent === true
  const rel = normRel(appRelPath)
  const nextDir = path.join(ROOT, rel, ".next")
  if (!fs.existsSync(nextDir)) return false

  try {
    fs.rmSync(nextDir, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 200,
    })
    if (!silent) {
      const { green, dim } = require("./dev-log.cjs")
      console.log(`${dim("clean-next")} ${green(`${rel}/.next`)} ${dim("removed")}`)
    }
    return true
  } catch (err) {
    const { warn } = require("./dev-log.cjs")
    warn(
      `[clean-next] could not remove ${rel}/.next: ${err instanceof Error ? err.message : err}`,
    )
    return false
  }
}

function resolvePaths(argv) {
  if (argv[0] === "--stack") {
    const stack = argv[1]
    const paths = STACK_NEXT_PATHS[stack]
    if (!paths?.length) {
      console.error(`[clean-next] unknown or empty stack: ${stack ?? "(none)"}`)
      process.exit(1)
    }
    return paths
  }

  if (argv.length > 0) {
    return argv.map((p) => {
      if (path.isAbsolute(p)) return normRel(path.relative(ROOT, p))
      return normRel(p)
    })
  }

  return NEXT_APP_PATHS
}

function main() {
  if (process.env.HUB_DEV_SKIP_NEXT_CLEAN === "1") {
    return
  }

  const paths = resolvePaths(process.argv.slice(2))
  const { dim, info } = require("./dev-log.cjs")
  let removed = 0
  for (const rel of paths) {
    if (cleanNextDir(rel)) removed += 1
  }
  if (removed === 0 && paths.length > 0 && process.env.HUB_DEV_LOG === "verbose") {
    info(`${dim("clean-next")} ${dim("already clean")}`)
  }
}

if (require.main === module) {
  main()
}

module.exports = { cleanNextDir, STACK_NEXT_PATHS, resolvePaths }
