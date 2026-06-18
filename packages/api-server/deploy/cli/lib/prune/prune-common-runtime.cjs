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

const STORE_MODULE_IDS = ['products', 'orders', 'promo-codes', 'carts']
const STORE_COMMON_FILES = [
  'cart-types.ts',
  'product-types.ts',
  'product-units.ts',
  'unit-pricing.ts',
  'promo-checkout.ts',
  'gift-rules.ts',
]

function pruneStoreCommonRuntime(destRoot, moduleIds, log) {
  const keepStore = STORE_MODULE_IDS.some((id) => moduleIds.includes(id))
  if (keepStore || !moduleIds.length) return 0

  let removed = 0
  const commonDir = path.join(destRoot, 'src/common')
  for (const file of STORE_COMMON_FILES) {
    const abs = path.join(commonDir, file)
    if (!fs.existsSync(abs)) continue
    fs.unlinkSync(abs)
    removed++
    log.detail('prune:common', `removed src/common/${file}`)
  }

  const commerceDir = path.join(commonDir, 'commerce')
  if (fs.existsSync(commerceDir)) {
    fs.rmSync(commerceDir, { recursive: true, force: true })
    removed++
    log.detail('prune:common', 'removed src/common/commerce/')
  }

  const seedFiles = [
    'seeds/storesync-sample.data.ts',
    'seeds/products-sample.runner.ts',
    'seeds/promo-codes-sample.runner.ts',
    'seeds/orders-sample.runner.ts',
  ]
  for (const rel of seedFiles) {
    const abs = path.join(destRoot, 'src', rel)
    if (!fs.existsSync(abs)) continue
    fs.unlinkSync(abs)
    removed++
    log.detail('prune:common', `removed src/${rel}`)
  }

  return removed
}

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

  removed += pruneStoreCommonRuntime(destRoot, options.moduleIds ?? [], log)

  if (removed > 0) {
    const { writeCommonBarrel } = require('../sync/sync-module-bases.cjs')
    writeCommonBarrel(destRoot)
    log.step('prune:common', `removed ${removed} file (${removedFiles.join(', ')})`)
  }

  return removed
}

module.exports = { pruneCommonRuntime, DEAD_COMMON_ROOT_FILES }
