/**
 * Copy module-bases/ theo module render — bỏ Base* không thuộc closure.
 */
const fs = require('node:fs')
const path = require('node:path')
const { getTemplateForModuleId } = require('../../../config/package-module-templates.cjs')

function resolveModuleBasePackageDirs(moduleIds) {
  const dirs = new Set()
  for (const moduleId of moduleIds) {
    const template = getTemplateForModuleId(moduleId)
    if (template?.materialize === 'thin' && template.packageDir) {
      dirs.add(template.packageDir)
    }
  }
  return dirs
}

function pruneModuleBasesRuntime(appRoot, moduleIds, { quiet = false } = {}) {
  const baseRoot = path.join(appRoot, 'src/common/module-bases')
  if (!fs.existsSync(baseRoot)) return 0

  const keep = resolveModuleBasePackageDirs(moduleIds)
  let removed = 0

  for (const entry of fs.readdirSync(baseRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (keep.has(entry.name)) continue
    fs.rmSync(path.join(baseRoot, entry.name), { recursive: true, force: true })
    removed++
    if (!quiet) {
      console.log(`[prune:module-bases] removed src/common/module-bases/${entry.name}/`)
    }
  }

  return removed
}

module.exports = { pruneModuleBasesRuntime, resolveModuleBasePackageDirs }
