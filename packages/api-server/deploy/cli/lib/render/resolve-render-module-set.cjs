/**
 * Tập module runtime mong đợi sau render — config + graph closure (không gồm shell SKIP_DIRS).
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { resolveApiModules } = require('../../../config/render.config.cjs')
const { resolveTemplateRoot, SKIP_DIRS } = require('../../../config/template.config.cjs')
const { resolveModuleClosure } = require('./resolve-module-closure.cjs')

/**
 * @param {string} appRel
 * @param {{ expandClosure?: boolean }} [opts]
 */
function resolveRenderModuleSet(appRel, opts = {}) {
  const { modules, renderAllModules } = resolveApiModules(appRel)
  const expandClosure = opts.expandClosure !== false && !renderAllModules

  if (renderAllModules) {
    const templateRoot = resolveTemplateRoot()
    const srcDir = path.join(templateRoot, 'src')
    return fs
      .readdirSync(srcDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b))
  }

  let set = [...modules]
  if (expandClosure) {
    set = resolveModuleClosure(modules, resolveTemplateRoot())
  }
  return [...new Set(set.filter((id) => !SKIP_DIRS.has(id)))].sort((a, b) =>
    a.localeCompare(b),
  )
}

function listRuntimeModuleDirs(appRoot) {
  const srcDir = path.join(appRoot, 'src')
  if (!fs.existsSync(srcDir)) return []
  return fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b))
}

/**
 * @param {string} appRel
 */
function auditRenderModuleGraph(appRel) {
  const appRoot = path.join(ROOT, appRel)
  const expected = resolveRenderModuleSet(appRel)
  const expectedSet = new Set(expected)
  const onDisk = listRuntimeModuleDirs(appRoot)

  const orphans = onDisk.filter((id) => !expectedSet.has(id))
  const missing = expected.filter((id) => !onDisk.includes(id))

  return { appRel, expected, onDisk, orphans, missing }
}

module.exports = {
  resolveRenderModuleSet,
  listRuntimeModuleDirs,
  auditRenderModuleGraph,
}
