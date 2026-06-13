/**
 * Verify hub-event API scaffold khớp api.app.config.json (@workspace/api-server).
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const require = createRequire(import.meta.url)
const {
  REGISTRY,
  renderPublicServiceBindings,
  renderExtraProviderService,
} = require('../api/api-module-registry.cjs')
const { resolveApiModules } = require('../api/resolve-api-modules.cjs')

const APP_REL = 'apps/hub-event/api'
const appRoot = path.join(ROOT, APP_REL)

if (!fs.existsSync(path.join(appRoot, 'api.app.config.json'))) {
  console.error('[verify-checkin-api-modules] Thiếu api.app.config.json')
  process.exit(1)
}

const {
  modules,
  nativeModules,
  preserveControllers,
  scaffoldControllers,
  scaffoldModuleFiles,
} = resolveApiModules(APP_REL)

const errors = []
let servicesChecked = 0
let controllersChecked = 0
let modulesChecked = 0

for (const moduleId of modules) {
  if (nativeModules.has(moduleId)) continue

  const def = REGISTRY[moduleId]
  if (!def) {
    errors.push(
      `Module scaffold "${moduleId}" chưa có trong api-module-registry.cjs`,
    )
    continue
  }

  const verifyServiceFile = (servicePath, baseService) => {
    servicesChecked++
    if (!fs.existsSync(servicePath)) {
      errors.push(`Thiếu file: ${path.relative(ROOT, servicePath)}`)
      return
    }
    const content = fs.readFileSync(servicePath, 'utf8')
    if (!content.includes('AUTO-GENERATED')) {
      errors.push(
        `${path.relative(ROOT, servicePath)} không phải AUTO-GENERATED (chạy pnpm api:generate:checkin)`,
      )
    }
    if (
      baseService &&
      def.kind !== 'em-only' &&
      !content.includes(`extends ${baseService}`)
    ) {
      errors.push(
        `${path.relative(ROOT, servicePath)} không extend ${baseService}`,
      )
    }
  }

  if (def.serviceNative) {
    servicesChecked++
    const servicePath = path.join(appRoot, 'src', def.folder, def.serviceFile ?? 'system.service.ts')
    if (!fs.existsSync(servicePath)) {
      errors.push(`Thiếu file native service: ${path.relative(ROOT, servicePath)}`)
    }
  } else if (def.kind === 'public-multi-binding') {
    for (const binding of renderPublicServiceBindings()) {
      const servicePath = path.join(appRoot, 'src', def.folder, binding.file)
      const baseMatch = binding.content.match(/extends (Base[A-Za-z]+)/)
      verifyServiceFile(servicePath, baseMatch?.[1])
    }
  } else if (!def.skipPrimaryService) {
    const servicePath = path.join(appRoot, 'src', def.folder, def.serviceFile)
    verifyServiceFile(servicePath, def.baseService)
  }

  for (const extra of def.extraProviders ?? []) {
    if (!extra.kind) continue
    const servicePath = path.join(appRoot, 'src', def.folder, extra.file)
    const rendered = renderExtraProviderService(extra, def)
    const baseMatch = rendered?.match(/extends (Base[A-Za-z]+)/)
    verifyServiceFile(servicePath, baseMatch?.[1])
  }

  const shouldVerifyController =
    scaffoldControllers &&
    !preserveControllers.has(moduleId) &&
    def.controllerFile &&
    (def.controllerTemplate || (def.controller && !def.controllerNative))

  const usesPackageController = Boolean(def.packageController?.className)

  if (
    scaffoldControllers &&
    !preserveControllers.has(moduleId) &&
    def.controllerFile &&
    usesPackageController
  ) {
    controllersChecked++
    const controllerPath = path.join(appRoot, 'src', def.folder, def.controllerFile)
    if (!fs.existsSync(controllerPath)) {
      errors.push(`Thiếu file: ${path.relative(ROOT, controllerPath)}`)
    } else {
      const content = fs.readFileSync(controllerPath, 'utf8')
      if (!content.includes('AUTO-GENERATED')) {
        errors.push(
          `${path.relative(ROOT, controllerPath)} không phải AUTO-GENERATED (chạy pnpm api:generate:checkin)`,
        )
      }
      if (!content.includes('@workspace/api-server/modules/')) {
        errors.push(
          `${path.relative(ROOT, controllerPath)} phải import từ @workspace/api-server (packages-first)`,
        )
      }
      if (!content.includes('extends Package')) {
        errors.push(
          `${path.relative(ROOT, controllerPath)} phải extend Base*Controller từ package (extends Package...)`,
        )
      }
      if (!content.includes(`export class ${def.controllerClass}`)) {
        errors.push(
          `${path.relative(ROOT, controllerPath)} thiếu class ${def.controllerClass}`,
        )
      }
    }
  } else if (shouldVerifyController) {
    controllersChecked++
    const controllerPath = path.join(appRoot, 'src', def.folder, def.controllerFile)
    if (!fs.existsSync(controllerPath)) {
      errors.push(`Thiếu file: ${path.relative(ROOT, controllerPath)}`)
    } else {
      const content = fs.readFileSync(controllerPath, 'utf8')
      if (!content.includes('AUTO-GENERATED')) {
        errors.push(
          `${path.relative(ROOT, controllerPath)} không phải AUTO-GENERATED`,
        )
      }
      if (!content.includes(`export class ${def.controllerClass}`)) {
        errors.push(
          `${path.relative(ROOT, controllerPath)} thiếu class ${def.controllerClass}`,
        )
      }
    }
  }

  if (scaffoldModuleFiles && !def.moduleNative) {
    modulesChecked++
    const modulePath = path.join(appRoot, 'src', def.folder, `${def.folder}.module.ts`)
    if (!fs.existsSync(modulePath)) {
      errors.push(`Thiếu file: ${path.relative(ROOT, modulePath)}`)
    } else {
      const content = fs.readFileSync(modulePath, 'utf8')
      if (!content.includes('AUTO-GENERATED')) {
        errors.push(`${path.relative(ROOT, modulePath)} không phải AUTO-GENERATED`)
      }
    }
  }
}

if (errors.length) {
  console.error('[verify-checkin-api-modules] FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

console.log(
  `[verify-checkin-api-modules] OK — ${servicesChecked} service(s), ${controllersChecked} controller(s), ${modulesChecked} module(s)`,
)
