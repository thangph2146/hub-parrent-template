/**
 * Verify API deploy materialize từ template (check-in / parent / store).
 *
 * Usage: node deploy/cli/verify/verify-render-api.mjs [apps/hub-event/api]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { ROOT } = require('../lib/monorepo-root.cjs')
const { resolveApiModules } = require('../../config/render.config.cjs')

const APP_REL = (process.argv[2] ?? 'apps/hub-event/api').replace(/\\/g, '/')
const appRoot = path.join(ROOT, APP_REL)

if (!fs.existsSync(path.join(appRoot, 'api.app.config.json'))) {
  console.error(`[verify:render-api] Thiếu ${APP_REL}/api.app.config.json`)
  process.exit(1)
}

const { modules } = resolveApiModules(APP_REL)
const errors = []

for (const rel of ['package.json', 'nest-cli.json', 'src/main.ts', 'src/app.module.ts']) {
  if (!fs.existsSync(path.join(appRoot, rel))) errors.push(`Thiếu ${rel}`)
}

for (const moduleId of modules) {
  const moduleDir = path.join(appRoot, 'src', moduleId)
  if (!fs.existsSync(moduleDir)) {
    errors.push(`Thiếu src/${moduleId}/`)
    continue
  }
  if (!fs.readdirSync(moduleDir).some((n) => n.endsWith('.module.ts'))) {
    errors.push(`src/${moduleId}/ không có *.module.ts`)
  }
}

if (errors.length) {
  console.error(`[verify:render-api] FAIL ${APP_REL}:\n` + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

const label = APP_REL.split('/').slice(1, 2).join('-') || 'api'
console.log(`[verify:render-api] OK — ${APP_REL} · ${modules.length} module (${label})`)
