/**
 * Verify hub-event API scaffold services khớp api.app.config.json.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const require = createRequire(import.meta.url)
const { REGISTRY, GENERATED_BANNER } = require('../api/api-module-registry.cjs')

const APP_REL = 'apps/hub-event/api'
const appRoot = path.join(ROOT, APP_REL)
const configPath = path.join(appRoot, 'api.app.config.json')

if (!fs.existsSync(configPath)) {
  console.error('[verify-checkin-api-modules] Thiếu api.app.config.json')
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const preserve = new Set(config.native?.services ?? [])
const modules = config.scaffoldModules ?? []
const errors = []
let checked = 0

for (const moduleId of modules) {
  if (preserve.has(moduleId)) continue
  checked++
  const def = REGISTRY[moduleId]
  if (!def) {
    errors.push(`Module "${moduleId}" chưa có trong api-module-registry.cjs`)
    continue
  }
  const servicePath = path.join(appRoot, 'src', def.folder, def.serviceFile)
  if (!fs.existsSync(servicePath)) {
    errors.push(`Thiếu file: ${path.relative(ROOT, servicePath)}`)
    continue
  }
  const content = fs.readFileSync(servicePath, 'utf8')
  if (!content.includes('AUTO-GENERATED')) {
    errors.push(
      `${path.relative(ROOT, servicePath)} không phải AUTO-GENERATED (chạy pnpm api:generate:checkin)`,
    )
  }
  if (!content.includes(`extends ${def.baseService}`)) {
    errors.push(
      `${path.relative(ROOT, servicePath)} không extend ${def.baseService}`,
    )
  }
}

if (errors.length) {
  console.error('[verify-checkin-api-modules] FAIL')
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`[verify-checkin-api-modules] OK — ${checked} scaffold service(s)`)
