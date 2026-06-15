/**
 * Tạo / patch .env từ env profile sau render.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('./lib/monorepo-root.cjs')
const {
  writeApiEnvExampleForAppPath,
  applyApiEnvProfileToDotEnv,
  getApiEnvProfileForAppPath,
} = require(path.join(ROOT, 'script-system/env/api-env-profiles.cjs'))

function formatEnvResult(appRel, result) {
  if (result.skipped) {
    if (result.reason === 'no-example') {
      console.warn(`[api:render] bỏ qua .env — thiếu ${appRel}/.env.example`)
    } else if (result.reason === 'no-profile') {
      console.warn(`[api:render] bỏ qua .env — không có env profile: ${appRel}`)
    }
    return result
  }

  const dbTag = result.database ? ` (db=${result.database})` : ''
  if (result.overwritten) {
    console.log(`[api:render] ghi đè ${appRel}/.env từ .env.example${dbTag}`)
  } else if (result.created) {
    console.log(`[api:render] tạo ${appRel}/.env từ .env.example${dbTag}`)
  } else if (result.patched) {
    const keys = result.patchedKeys?.join(', ') ?? 'profile'
    console.log(`[api:render] patch ${appRel}/.env — ${keys}${dbTag}`)
  } else {
    console.log(`[api:render] .env đã khớp profile${dbTag}: ${appRel}/.env`)
  }

  return result
}

function ensureAppEnv(appRel, { force = false } = {}) {
  const normalized = appRel.replace(/\\/g, '/')

  if (normalized !== 'apps/main/api') {
    writeApiEnvExampleForAppPath(normalized)
  }

  const profile = getApiEnvProfileForAppPath(normalized)
  if (!profile) {
    const example = path.join(ROOT, normalized, '.env.example')
    const dest = path.join(ROOT, normalized, '.env')
    if (!fs.existsSync(example)) {
      console.warn(`[api:render] bỏ qua .env — thiếu ${normalized}/.env.example`)
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

  const result = applyApiEnvProfileToDotEnv(normalized, {
    createIfMissing: true,
    force,
  })
  return formatEnvResult(normalized, result)
}

module.exports = { ensureAppEnv }
