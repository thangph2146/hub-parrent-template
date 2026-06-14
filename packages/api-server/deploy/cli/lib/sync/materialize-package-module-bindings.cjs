/**
 * Sinh binding mỏng extends Base* vend trong src/common/module-bases (pattern packages/api-server/src/modules/users).
 */
const fs = require('node:fs')
const path = require('node:path')
const {
  getPackageBaseModules,
  parsePackageModuleBinding,
  renderPackageService,
  renderPackageController,
} = require('../../../config/package-module-bindings.cjs')
const { createLogger } = require('../cli-logger.cjs')
const { mainModulePaths } = require('../../../config/auto-package-module-bindings.cjs')

function mainHasOopBinding(moduleId) {
  const { service } = mainModulePaths(moduleId)
  if (!fs.existsSync(service)) return false
  return /extends Base\w+Service/.test(fs.readFileSync(service, 'utf8'))
}

function shouldCopyMainBinding(meta) {
  const cfg = meta.config
  return Boolean(
    cfg.skipOop ||
    cfg.preserveController ||
    cfg.customController ||
    mainHasOopBinding(meta.moduleId),
  )
}

function copyMainModuleBinding(meta, templateRoot) {
  const { moduleId, config } = meta
  const paths = mainModulePaths(moduleId)
  const destDir = path.join(templateRoot, 'src', moduleId)
  fs.mkdirSync(destDir, { recursive: true })

  if (fs.existsSync(paths.service)) {
    fs.copyFileSync(
      paths.service,
      path.join(destDir, `${moduleId}.service.ts`),
    )
  }

  const controllerOut =
    config.controllerOutputFile ??
    config.controllerFile ??
    `${moduleId}.controller.ts`

  if (config.customController) {
    fs.writeFileSync(
      path.join(destDir, controllerOut),
      config.customController.replace(/\r\n/g, '\n'),
      'utf8',
    )
  } else if (fs.existsSync(paths.controller)) {
    fs.copyFileSync(paths.controller, path.join(destDir, controllerOut))
  }

  for (const [fileName, content] of Object.entries(config.companionServices ?? {})) {
    fs.writeFileSync(
      path.join(destDir, fileName),
      content.replace(/\r\n/g, '\n'),
      'utf8',
    )
  }

  const copyFiles = [
    ...(config.copySiblingFiles ?? []),
    ...(config.serviceExtensions?.copySiblingFiles ?? []),
  ]
  for (const fileName of copyFiles) {
    const src = path.join(paths.service, '..', fileName)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(destDir, fileName))
    }
  }

  if (meta.moduleSrc) {
    fs.writeFileSync(path.join(destDir, `${moduleId}.module.ts`), meta.moduleSrc, 'utf8')
  }
}

function writePackageModule(meta, templateRoot) {
  if (shouldCopyMainBinding(meta)) {
    copyMainModuleBinding(meta, templateRoot)
    return
  }

  const destDir = path.join(templateRoot, 'src', meta.moduleId)
  fs.mkdirSync(destDir, { recursive: true })

  fs.writeFileSync(
    path.join(destDir, `${meta.moduleId}.service.ts`),
    renderPackageService(meta).replace(/\r\n/g, '\n'),
    'utf8',
  )
  fs.writeFileSync(
    path.join(destDir, `${meta.moduleId}.controller.ts`),
    renderPackageController(meta).replace(/\r\n/g, '\n'),
    'utf8',
  )

  for (const [fileName, content] of Object.entries(meta.config.companionServices ?? {})) {
    fs.writeFileSync(
      path.join(destDir, fileName),
      content.replace(/\r\n/g, '\n'),
      'utf8',
    )
  }

  if (meta.moduleSrc) {
    fs.writeFileSync(path.join(destDir, `${meta.moduleId}.module.ts`), meta.moduleSrc, 'utf8')
  }
}

function materializePackageModuleBindings(templateRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  let bound = 0
  let skipped = 0

  for (const [moduleId, config] of Object.entries(getPackageBaseModules())) {
    const meta = parsePackageModuleBinding(moduleId, config)
    if (!meta) {
      skipped++
      log.warn('sync:template', `package-base skip: ${moduleId}`)
      continue
    }

    try {
      writePackageModule(meta, templateRoot)
      bound++
      if (shouldCopyMainBinding(meta)) {
        log.detail('sync:template', `package-base copy main: ${moduleId}`)
      }
    } catch (err) {
      skipped++
      log.warn('sync:template', `package-base fallback ${moduleId}: ${err.message}`)
    }
  }

  log.detail('sync:template', `package-base OOP: ${bound} module · ${skipped} skip`)

  return { bound, skipped }
}

module.exports = { materializePackageModuleBindings }
