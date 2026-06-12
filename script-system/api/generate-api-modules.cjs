/**
 * Generate thin NestJS service/controller/module từ api.app.config.json + @workspace/api-server.
 * Pattern tương tự admin.app.config.json + pnpm admin:generate:checkin.
 *
 * Usage:
 *   node script-system/api/generate-api-modules.cjs apps/hub-event/api
 *   node script-system/api/generate-api-modules.cjs apps/hub-event/api --prune
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../lib/paths.cjs')
const {
  REGISTRY,
  renderService,
  renderExtraProviderService,
  renderPublicServiceBindings,
  GENERATED_BANNER,
} = require('./api-module-registry.cjs')
const { renderController } = require('./render-api-controller.cjs')
const { renderApiModule } = require('./render-api-module.cjs')
const { resolveApiModules } = require('./resolve-api-modules.cjs')

function sleepSync(ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    /* Windows: chờ index/antivirus sau ghi file */
  }
}

function isRetryableFsError(err) {
  return (
    err?.code === 'EBUSY' ||
    err?.code === 'EPERM' ||
    err?.code === 'UNKNOWN' ||
    err?.errno === -4094
  )
}

function writeFileWithRetry(filePath, content) {
  let lastErr
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      fs.writeFileSync(filePath, content, 'utf8')
      return
    } catch (err) {
      lastErr = err
      if (!isRetryableFsError(err) || attempt === 7) throw err
      sleepSync(80 * (attempt + 1))
    }
  }
  throw lastErr
}

function pruneModuleFolder(
  moduleDir,
  preserveRelFiles = [],
  preserveControllerFiles = [],
) {
  if (!fs.existsSync(moduleDir)) return
  const preserve = new Set([...preserveRelFiles, ...preserveControllerFiles])

  for (const entry of fs.readdirSync(moduleDir, { withFileTypes: true })) {
    if (preserve.has(entry.name)) continue
    const full = path.join(moduleDir, entry.name)
    if (entry.isDirectory()) {
      fs.rmSync(full, { recursive: true, force: true })
      continue
    }
    if (!entry.isFile()) continue
    const content = fs.readFileSync(full, 'utf8')
    if (!content.includes('AUTO-GENERATED')) {
      fs.unlinkSync(full)
    }
  }
}

function main() {
  const args = process.argv.slice(2)
  const prune = args.includes('--prune')
  const appRel = args.find((a) => !a.startsWith('--')) ?? 'apps/hub-event/api'
  const {
    config,
    modules,
    nativeModules,
    preserveControllers,
    scaffoldControllers,
    scaffoldModuleFiles,
  } = resolveApiModules(appRel)
  const appRoot = path.join(ROOT, appRel)

  if (!modules.length) {
    console.warn(`[api:generate] ${appRel}: modules rỗng — bỏ qua`)
    return
  }

  let servicesWritten = 0
  let servicesSkipped = 0
  let controllersWritten = 0
  let controllersSkipped = 0
  let modulesWritten = 0
  let modulesSkipped = 0

  for (const moduleId of modules) {
    if (nativeModules.has(moduleId)) {
      console.log(`[api:generate] skip native module: ${moduleId}`)
      servicesSkipped++
      controllersSkipped++
      modulesSkipped++
      continue
    }

    const def = REGISTRY[moduleId]
    if (!def) {
      throw new Error(
        `[api:generate] Module "${moduleId}" chưa có trong script-system/api/api-module-registry.cjs`,
      )
    }

    const destDir = path.join(appRoot, 'src', def.folder)

    if (prune) {
      const preserveControllerFiles = []
      if (preserveControllers.has(moduleId)) {
        if (def.controllerFile) preserveControllerFiles.push(def.controllerFile)
        for (const item of def.extraControllers ?? []) {
          preserveControllerFiles.push(item.file)
        }
        for (const item of def.extraProviders ?? []) {
          preserveControllerFiles.push(item.file)
        }
        for (const file of def.preserveNativeFiles ?? []) {
          preserveControllerFiles.push(file)
        }
      }
      pruneModuleFolder(
        destDir,
        config.native?.preserveFiles ?? [],
        preserveControllerFiles,
      )
      console.log(`[api:generate] pruned: ${path.relative(ROOT, destDir)}`)
    }

    fs.mkdirSync(destDir, { recursive: true })

    if (def.kind === 'public-multi-binding') {
      for (const binding of renderPublicServiceBindings()) {
        const bindingPath = path.join(destDir, binding.file)
        writeFileWithRetry(bindingPath, binding.content)
        console.log(`[api:generate] wrote ${path.relative(ROOT, bindingPath)}`)
        servicesWritten++
      }
    } else if (def.serviceNative) {
      console.log(`[api:generate] skip native service: ${moduleId}`)
      servicesSkipped++
    } else if (def.skipPrimaryService) {
      servicesSkipped++
    } else {
      const destFile = path.join(destDir, def.serviceFile)
      writeFileWithRetry(destFile, renderService(moduleId))
      console.log(`[api:generate] wrote ${path.relative(ROOT, destFile)}`)
      servicesWritten++
    }

    for (const extra of def.extraProviders ?? []) {
      if (!extra.kind) continue
      const extraContent = renderExtraProviderService(extra, def)
      if (!extraContent) {
        throw new Error(
          `[api:generate] extra provider "${extra.class}" kind="${extra.kind}" chưa có renderer`,
        )
      }
      const extraPath = path.join(destDir, extra.file)
      writeFileWithRetry(extraPath, extraContent)
      console.log(`[api:generate] wrote ${path.relative(ROOT, extraPath)}`)
      servicesWritten++
    }

    if (scaffoldControllers) {
      const hasControllerTemplate = Boolean(def.controllerTemplate || def.controller)
      const skipController =
        preserveControllers.has(moduleId) ||
        (def.controllerNative && !def.controllerTemplate) ||
        !def.controllerFile ||
        !hasControllerTemplate

      if (skipController) {
        console.log(`[api:generate] skip controller: ${moduleId}`)
        controllersSkipped++
      } else {
        const controllerPath = path.join(destDir, def.controllerFile)
        const controllerContent = renderController(def)
        if (!controllerContent) {
          controllersSkipped++
        } else {
          writeFileWithRetry(controllerPath, controllerContent)
          console.log(`[api:generate] wrote ${path.relative(ROOT, controllerPath)}`)
          controllersWritten++
        }
      }
    }

    if (scaffoldModuleFiles && !def.moduleNative) {
      const modulePath = path.join(destDir, `${def.folder}.module.ts`)
      writeFileWithRetry(modulePath, renderApiModule(def))
      console.log(`[api:generate] wrote ${path.relative(ROOT, modulePath)}`)
      modulesWritten++
    } else if (def.moduleNative) {
      console.log(`[api:generate] skip native module file: ${moduleId}`)
      modulesSkipped++
    } else {
      modulesSkipped++
    }
  }

  console.log(
    `\n[api:generate] ${appRel}: services ${servicesWritten}/${servicesSkipped} skip; controllers ${controllersWritten}/${controllersSkipped} skip; modules ${modulesWritten}/${modulesSkipped} skip`,
  )
}

if (require.main === module) {
  main()
}

module.exports = { main, GENERATED_BANNER }
