/**
 * Entity closure cho partial render — đọc manifest graph, không ad-hoc.
 */
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { resolveModuleClosure } = require('../render/resolve-module-closure.cjs')
const { resolveTemplateRoot } = require('../../../config/template.config.cjs')
const { resolveEntityClosure } = require('./build-entity-graph.cjs')
const { loadEntityGraphManifest } = require('./entity-graph-manifest.cjs')

/**
 * @param {string[]} moduleIds Seed modules (trước module closure)
 * @param {{ expandModuleClosure?: boolean, includeAuthStack?: boolean }} [opts]
 */
function resolveEntityClosureForModules(moduleIds, opts = {}) {
  const graph = loadEntityGraphManifest(ROOT)
  let modules = [...moduleIds]

  if (opts.expandModuleClosure !== false) {
    const templateRoot = resolveTemplateRoot()
    modules = resolveModuleClosure(moduleIds, templateRoot)
  }

  const entityClosure = resolveEntityClosure(modules, graph, {
    includeAuthStack: opts.includeAuthStack,
  })

  return {
    modules,
    ...entityClosure,
    totalEntities: graph.entityCount,
    graph,
  }
}

module.exports = { resolveEntityClosureForModules }
