const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { PRODUCT_LINES, MAIN_API_PATH } = require('../../../config/product-lines.cjs')

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'))
}

function readPackageName(appRel) {
  const pkgPath = path.join(ROOT, appRel, 'package.json')
  if (!fs.existsSync(pkgPath)) return null
  try {
    return readJson(pkgPath).name ?? null
  } catch {
    return null
  }
}

function discoverApiAppTargets() {
  const targets = []
  for (const [line, apps] of Object.entries(PRODUCT_LINES)) {
    const api = apps.api
    if (!api?.path) continue
    const configPath = path.join(ROOT, api.path, 'api.app.config.json')
    const renderReady = fs.existsSync(configPath)
    let configId = ''
    let description = ''
    if (renderReady) {
      try {
        const cfg = readJson(configPath)
        configId = cfg.id ?? ''
        description = cfg.description ?? ''
      } catch {
        /* ignore */
      }
    }
    targets.push({
      appRel: api.path,
      line,
      configId,
      description,
      packageName: readPackageName(api.path),
      renderReady,
      isSourceOfTruth: api.path.replace(/\\/g, '/') === MAIN_API_PATH.replace(/\\/g, '/'),
    })
  }
  return targets
}

module.exports = { discoverApiAppTargets }
