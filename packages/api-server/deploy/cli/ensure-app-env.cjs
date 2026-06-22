/**
 * Tạo / patch .env từ env profile sau render.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('./lib/monorepo-root.cjs')
function ensureAppEnv(appRel, { force = false } = {}) {
  const normalized = appRel.replace(/\\/g, '/')
  const example = path.join(ROOT, normalized, '.env.example')
  const dest = path.join(ROOT, normalized, '.env')
  if (!fs.existsSync(example)) {
    console.warn(`[api:render] bỏ qua .env — downstream tự quản lý env: ${normalized}`)
    return { created: false, skipped: true, reason: 'no-example' }
  }
  if (fs.existsSync(dest) && !force) {
    console.log(`[api:render] .env đã có: ${normalized}/.env`)
    return { created: false, skipped: true, reason: 'exists' }
  }
  fs.copyFileSync(example, dest)
  console.log(`[api:render] tạo ${normalized}/.env từ .env.example`)
  return { created: true, skipped: false, via: 'copy' }
}

module.exports = { ensureAppEnv }
