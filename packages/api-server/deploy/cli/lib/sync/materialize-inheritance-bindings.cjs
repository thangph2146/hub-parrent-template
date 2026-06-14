/**
 * Phân loại module template sau sync main/api.
 * Thin CRUD → materialize-package-module-bindings (module-bases).
 * Còn lại → mirror folder main/api.
 *
 * Legacy BaseStandardAdminCrudService generator đã gỡ (0 module dùng).
 */
const { listTemplateModuleIds, SKIP_DIRS } = require('../../../config/template.config.cjs')
const { createLogger } = require('../cli-logger.cjs')
const {
  COPY_ONLY_MODULE_IDS,
  isStandardAdminCrudModule,
} = require('../../../config/module-bindings.cjs')

function materializeInheritanceBindings(templateRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const moduleIds = listTemplateModuleIds(templateRoot)
  let copied = 0
  let skipped = 0

  for (const moduleId of moduleIds) {
    if (SKIP_DIRS.has(moduleId)) continue

    if (COPY_ONLY_MODULE_IDS.has(moduleId) || !isStandardAdminCrudModule(moduleId)) {
      copied++
      continue
    }

    const { getTemplateForModuleId } = require('../../../config/package-module-templates.cjs')
    if (getTemplateForModuleId(moduleId)?.materialize === 'thin') {
      copied++
      continue
    }

    skipped++
    log.detail('sync:template', `giữ main mirror: ${moduleId}`)
  }

  log.detail(
    'sync:template',
    `OOP kế thừa local: 0 module · ${copied} mirror · ${skipped} fallback`,
  )

  return { inherited: 0, copied, skipped }
}

module.exports = { materializeInheritanceBindings }
