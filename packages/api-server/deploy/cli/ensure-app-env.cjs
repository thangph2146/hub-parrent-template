/**
 * Tạo .env từ .env.example cho app API sau render.
 */
const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')
const { ROOT } = require('./lib/monorepo-root.cjs')
const { PRODUCT_LINES } = require('../config/product-lines.cjs')

function stackForAppRel(appRel) {
  for (const [stack, apps] of Object.entries(PRODUCT_LINES)) {
    if (apps.api?.path === appRel) return stack
  }
  return null
}

function ensureAppEnv(appRel, { force = false } = {}) {
  const appRoot = path.join(ROOT, appRel)
  const example = path.join(appRoot, '.env.example')
  const dest = path.join(appRoot, '.env')

  if (!fs.existsSync(example)) {
    console.warn(`[api:render] bỏ qua .env — thiếu ${appRel}/.env.example`)
    return { created: false, skipped: true }
  }

  if (fs.existsSync(dest) && !force) {
    console.log(`[api:render] .env đã có: ${appRel}/.env`)
    return { created: false, skipped: true }
  }

  const stack = stackForAppRel(appRel)
  if (stack) {
    try {
      const flag = force ? '--force' : ''
      execSync(`node script-system/env/init-env.cjs ${stack} ${flag}`.trim(), {
        cwd: ROOT,
        stdio: 'inherit',
      })
      return { created: true, skipped: false, via: 'env:init' }
    } catch {
      /* fallback copy */
    }
  }

  fs.copyFileSync(example, dest)
  console.log(`[api:render] tạo ${appRel}/.env từ .env.example`)
  return { created: true, skipped: false, via: 'copy' }
}

module.exports = { ensureAppEnv, stackForAppRel }
