/**
 * Partial render: cắt app.module chỉ giữ module trong closure (+ bootstrap).
 */
const fs = require('node:fs')
const path = require('node:path')
const { createLogger } = require('../cli-logger.cjs')

const RENDER_BOOTSTRAP_MODULES = ['auth', 'public', 'socket']

function moduleIdToNestModuleName(moduleId) {
  const base = moduleId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return `${base}Module`
}

function extractModuleIdFromImportLine(line) {
  const m = line.match(/from '\.\/([^/]+)\/[^']+';/)
  return m?.[1] ?? null
}

function patchRenderAppModule(appRoot, keepModuleIds, options = {}) {
  const log = options.log ?? createLogger(options)
  const filePath = path.join(appRoot, 'src/app.module.ts')
  if (!fs.existsSync(filePath)) return false

  const keep = new Set([...RENDER_BOOTSTRAP_MODULES, ...keepModuleIds])
  const keepNestModules = new Set(
    [...keep].map((id) => moduleIdToNestModuleName(id)),
  )

  let lines = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n').split('\n')
  const next = []

  for (const line of lines) {
    const moduleId = extractModuleIdFromImportLine(line)
    if (moduleId && !keep.has(moduleId)) continue

    if (/^\s+[A-Z][A-Za-z0-9]+Module,\s*$/.test(line)) {
      const name = line.trim().replace(/,$/, '')
      if (!keepNestModules.has(name)) continue
    }

    next.push(line)
  }

  const out = next.join('\n')
  fs.writeFileSync(filePath, out, 'utf8')
  log.step(
    'render:app-module',
    `partial — giữ ${keep.size} module (${[...keep].slice(0, 5).join(', ')}${keep.size > 5 ? '…' : ''})`,
  )
  return true
}

module.exports = { patchRenderAppModule, RENDER_BOOTSTRAP_MODULES, moduleIdToNestModuleName }
