/**
 * Xóa file helper mirror dư trong src/{moduleId}/ khi logic đã nằm ở module-bases/.
 * Giữ binding (service/controller/module/spec) và file app-only (vd. order-checkout.ts).
 */
const fs = require('node:fs')
const path = require('node:path')
const { createLogger } = require('../cli-logger.cjs')
const { MANUAL_PACKAGE_MODULE_OVERRIDES } = require('../../../config/manual-package-module-overrides.cjs')
const {
  listThinMaterializeModuleIds,
  getTemplateForModuleId,
} = require('../../../config/package-module-templates.cjs')
const { patchPrunedModuleImports } = require('./patch-pruned-imports.cjs')

const BINDING_SUFFIXES = ['.service.ts', '.module.ts']

function isBindingFile(moduleId, fileName) {
  if (fileName.endsWith('.spec.ts')) return true
  if (fileName === `${moduleId}.controller.ts`) return true

  const manual = MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId] ?? {}
  if (manual.controllerOutputFile && fileName === manual.controllerOutputFile) return true
  if (manual.controllerFile && fileName === manual.controllerFile) return true
  if (manual.customController && fileName === `${moduleId}.controller.ts`) return true

  for (const suffix of BINDING_SUFFIXES) {
    if (fileName === `${moduleId}${suffix}`) return true
  }

  const copyFiles = manual.serviceExtensions?.copySiblingFiles ?? manual.copySiblingFiles ?? []
  if (copyFiles.includes(fileName)) return true

  return false
}

function pruneThinModuleRedundantFiles(appRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  let removed = 0
  /** @type {string[]} */
  const removedPaths = []

  for (const moduleId of listThinMaterializeModuleIds()) {
    const template = getTemplateForModuleId(moduleId)
    const packageDir = template?.packageDir ?? moduleId
    const moduleDir = path.join(appRoot, 'src', moduleId)
    const baseDir = path.join(appRoot, 'src/common/module-bases', packageDir)
    if (!fs.existsSync(moduleDir) || !fs.existsSync(baseDir)) continue

    for (const fileName of fs.readdirSync(moduleDir)) {
      if (!fileName.endsWith('.ts')) continue
    if (isBindingFile(moduleId, fileName)) continue
    if (fileName === 'event-registration-attendance.service.ts') continue

    const basePath = path.join(baseDir, fileName)
      if (!fs.existsSync(basePath)) continue

      fs.unlinkSync(path.join(moduleDir, fileName))
      removed++
      const rel = `src/${moduleId}/${fileName}`
      removedPaths.push(rel)
      log.detail('prune:thin-runtime', `removed ${rel}`)
    }
  }

  const patchedImports = patchPrunedModuleImports(appRoot, { log, verbose: log.verbose })

  if (removed > 0) {
    const sample = removedPaths.slice(0, 3).join(', ')
    const suffix = removedPaths.length > 3 ? ` · +${removedPaths.length - 3} file` : ''
    if (!log.verbose) {
      log.step('prune:thin-runtime', `removed ${removed} helper (${sample}${suffix})`)
    }
  } else if (patchedImports > 0 && !log.verbose) {
    log.step('prune:thin-runtime', `patched ${patchedImports} import(s) → module-bases`)
  }

  return removed
}

module.exports = { pruneThinModuleRedundantFiles, isBindingFile }
