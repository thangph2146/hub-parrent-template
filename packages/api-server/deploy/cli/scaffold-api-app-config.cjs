const fs = require('node:fs')
const path = require('node:path')
const clack = require('@clack/prompts')
const { ROOT, PACKAGE_ROOT } = require('./lib/monorepo-root.cjs')
const { PRODUCT_LINES, MAIN_API_PATH } = require('../config/product-lines.cjs')
const { presetForProductLine } = require('../config/render.config.cjs')

function readJson(absPath) {
  return JSON.parse(fs.readFileSync(absPath, 'utf8'))
}

function findLineForAppRel(appRel) {
  for (const [line, apps] of Object.entries(PRODUCT_LINES)) {
    if (apps.api?.path === appRel) return line
  }
  return appRel.split('/')[1] ?? 'api'
}

function defaultConfigForApp(appRel) {
  const line = findLineForAppRel(appRel)
  const preset = presetForProductLine(line)
  if (preset) return { ...preset }

  const pkgName = appRel.split('/').pop() ?? 'api'
  const id = `${line}-${pkgName}`.replace(/\//g, '-')
  return { id, description: `API ${line}` }
}

function hasApiAppConfig(appRel) {
  return fs.existsSync(path.join(ROOT, appRel, 'api.app.config.json'))
}

function exitOnCancel(value) {
  if (clack.isCancel(value)) {
    clack.cancel('Đã hủy')
    process.exit(0)
  }
  return value
}

async function ensureApiAppConfig(appRel, { interactive = false, force = false } = {}) {
  const normalized = appRel.replace(/\\/g, '/')
  if (normalized === MAIN_API_PATH.replace(/\\/g, '/')) {
    throw new Error(
      `[api:render] ${MAIN_API_PATH} là SOT — không tạo api.app.config.json / không render vào đây.`,
    )
  }

  const configPath = path.join(ROOT, appRel, 'api.app.config.json')
  if (fs.existsSync(configPath) && !force) return readJson(configPath)

  const examplePath = path.join(PACKAGE_ROOT, 'deploy/config/api.app.config.example.json')
  const sample = fs.existsSync(examplePath)
    ? readJson(examplePath)
    : defaultConfigForApp(appRel)

  const merged = { ...defaultConfigForApp(appRel), ...sample }

  if (interactive && process.stdin.isTTY) {
    clack.log.info(`Tạo api.app.config.json cho ${appRel}`)
    const configId = exitOnCancel(
      await clack.text({
        message: 'Tên cấu hình (id)',
        initialValue: merged.id ?? defaultConfigForApp(appRel).id,
        validate: (v) => (!v?.trim() ? 'Bắt buộc' : undefined),
      }),
    )
    merged.id = String(configId).trim()

    const description = exitOnCancel(
      await clack.text({
        message: 'Mô tả (tuỳ chọn)',
        initialValue: merged.description ?? '',
      }),
    )
    if (description?.trim()) merged.description = String(description).trim()
  }

  fs.mkdirSync(path.dirname(configPath), { recursive: true })
  fs.writeFileSync(configPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
  clack.log.success(`Đã tạo ${appRel}/api.app.config.json (id: ${merged.id})`)
  return merged
}

module.exports = { ensureApiAppConfig, hasApiAppConfig, defaultConfigForApp }
