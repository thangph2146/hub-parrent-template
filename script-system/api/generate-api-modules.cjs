/**
 * Generate thin NestJS service từ api.app.config.json + @workspace/api-server.
 * Pattern tương tự admin.app.config.json + pnpm admin:generate:checkin.
 *
 * Usage:
 *   node script-system/api/generate-api-modules.cjs apps/hub-event/api
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')
const { REGISTRY, renderService, GENERATED_BANNER } = require('./api-module-registry.cjs')

function sleepSync(ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    /* Windows: chờ index/antivirus sau ghi file */
  }
}

function isRetryableFsError(err) {
  return (
    err?.code === 'EBUSY' ||
    err?.code === 'EPERM' ||
    err?.code === 'UNKNOWN' ||
    err?.errno === -4094
  )
}

function writeFileWithRetry(filePath, content, label) {
  let lastErr
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      fs.writeFileSync(filePath, content, 'utf8')
      return
    } catch (err) {
      lastErr = err
      if (!isRetryableFsError(err) || attempt === 7) throw err
      sleepSync(80 * (attempt + 1))
    }
  }
  throw lastErr
}

function readConfig(appRel) {
  const jsonPath = path.join(ROOT, appRel, 'api.app.config.json')
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Không tìm thấy api.app.config.json tại ${appRel}`)
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
}

function main() {
  const appRel = process.argv[2] ?? 'apps/hub-event/api'
  const config = readConfig(appRel)
  const appRoot = path.join(ROOT, appRel)
  const preserve = new Set(config.native?.services ?? [])
  const modules = config.scaffoldModules ?? []

  if (!modules.length) {
    console.warn(`[api:generate] ${appRel}: scaffoldModules rỗng — bỏ qua`)
    return
  }

  let written = 0
  let skipped = 0

  for (const moduleId of modules) {
    if (preserve.has(moduleId)) {
      console.log(`[api:generate] skip native service: ${moduleId}`)
      skipped++
      continue
    }
    if (!REGISTRY[moduleId]) {
      throw new Error(
        `[api:generate] Module "${moduleId}" chưa có trong script-system/api/api-module-registry.cjs`,
      )
    }

    const def = REGISTRY[moduleId]
    const destDir = path.join(appRoot, 'src', def.folder)
    const destFile = path.join(destDir, def.serviceFile)
    fs.mkdirSync(destDir, { recursive: true })
    const content = renderService(moduleId)
    writeFileWithRetry(destFile, content, def.folder)
    console.log(`[api:generate] wrote ${path.relative(ROOT, destFile)}`)
    written++
  }

  console.log(
    `\n[api:generate] ${appRel}: ${written} service generated, ${skipped} preserved`,
  )
}

if (require.main === module) {
  main()
}

module.exports = { readConfig, main, GENERATED_BANNER }
