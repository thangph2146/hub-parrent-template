const {
  listTemplateModuleIds,
  resolveTemplateRoot,
  templateHasSource,
} = require('../../../config/template.config.cjs')
const { listMainApiModuleIds } = require('./list-main-api-modules.cjs')

function listAllModulesForRender() {
  if (templateHasSource()) {
    try {
      return listTemplateModuleIds(resolveTemplateRoot())
    } catch {
      /* fallback */
    }
  }
  return listMainApiModuleIds()
}

function canRenderModule(moduleId) {
  return listAllModulesForRender().includes(moduleId)
}

module.exports = { listAllModulesForRender, canRenderModule }
