/**
 * Vend *.service.spec.ts từ apps/main/api → deploy/nest/src/<module>/ (sau cleanTemplateSpecs).
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { createLogger } = require('../cli-logger.cjs')
const { MAIN_API_PATH } = require('../../../config/template.config.cjs')
const { listTemplateModuleIds, SKIP_DIRS } = require('../../../config/template.config.cjs')

/** moduleId → thêm file spec không theo pattern `<moduleId>.service.spec.ts`. */
const MODULE_SPEC_FILES = {
  hanet: ['hanet-webhook.service.spec.ts'],
  public: ['public-categories.service.spec.ts'],
}

const SKIP_MODULE_SPECS = new Set(['proxy-image', 'socket', 'messages'])

function listModuleSpecSources(moduleId) {
  const files = [`${moduleId}.service.spec.ts`, ...(MODULE_SPEC_FILES[moduleId] ?? [])]
  return [...new Set(files)]
}

function syncModuleServiceSpecs(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const mainModuleRoot = path.join(ROOT, MAIN_API_PATH, 'src')
  let copied = 0
  let skipped = 0

  for (const moduleId of listTemplateModuleIds(destRoot)) {
    if (SKIP_DIRS.has(moduleId) || SKIP_MODULE_SPECS.has(moduleId)) continue

    for (const fileName of listModuleSpecSources(moduleId)) {
      const srcPath = path.join(mainModuleRoot, moduleId, fileName)
      if (!fs.existsSync(srcPath)) {
        skipped++
        continue
      }

      const destPath = path.join(destRoot, 'src', moduleId, fileName)
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      let content = fs.readFileSync(srcPath, 'utf8').replace(/\r\n/g, '\n')
      const banner =
        '/** AUTO-SYNC — tham chiếu từ apps/main/api; binding nest extends Base* (module-bases). */\n'
      if (!content.startsWith('/** AUTO-SYNC')) {
        content = banner + content
      }
      fs.writeFileSync(destPath, content, 'utf8')
      copied++
      log.detail(
        'sync:module-specs',
        `apps/main/api/src/${moduleId}/${fileName} → src/${moduleId}/${fileName}`,
      )
    }
  }

  log.step('sync:module-specs', `${copied} service spec(s) · ${skipped} skip (no source)`)

  return { copied, skipped }
}

module.exports = { syncModuleServiceSpecs, MODULE_SPEC_FILES, SKIP_MODULE_SPECS }
