/**
 * Dọn file common root không dùng trong template nest (copy thừa từ main/api).
 */
const fs = require('node:fs')
const path = require('node:path')
const { createLogger } = require('../cli-logger.cjs')

/** Copy từ main nhưng không có import trong template nest / module-bases. */
const DEAD_COMMON_ROOT_FILES = new Set([
  'legacy-audit-timestamps.ts',
  'dev-login-options.ts',
  'parse-setting-value.ts',
])

function pruneCommonRuntime(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const commonDir = path.join(destRoot, 'src/common')
  if (!fs.existsSync(commonDir)) return 0

  let removed = 0
  /** @type {string[]} */
  const removedFiles = []
  for (const file of fs.readdirSync(commonDir)) {
    if (!file.endsWith('.ts')) continue
    const isSpec = file.endsWith('.spec.ts')
    const isDead = DEAD_COMMON_ROOT_FILES.has(file)
    if (!isSpec && !isDead) continue

    fs.unlinkSync(path.join(commonDir, file))
    removed++
    removedFiles.push(file)
    log.detail('prune:common', `removed src/common/${file}`)
  }

  if (removed > 0) {
    const { writeCommonBarrel } = require('../sync/sync-module-bases.cjs')
    writeCommonBarrel(destRoot)
    log.step('prune:common', `removed ${removed} file (${removedFiles.join(', ')})`)
  }

  return removed
}

module.exports = { pruneCommonRuntime, DEAD_COMMON_ROOT_FILES }
