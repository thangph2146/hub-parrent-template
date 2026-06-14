/**
 * Đối chiếu route handler giữa apps/main/api và deploy/nest template.
 * Template OOP: route nằm ở binding + src/common/module-bases/{packageDir}/.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { ROOT } = require('../lib/monorepo-root.cjs')
const { resolveTemplateRoot } = require('../../config/template.config.cjs')
const { getTemplateForModuleId } = require('../../config/package-module-templates.cjs')

const TEMPLATE_SRC = path.join(resolveTemplateRoot(), 'src')

const UNIFIED = [
  'events',
  'comments',
  'accounts',
  'page-contents',
  'notifications',
  'sessions',
  'event-checkins',
  'event-registrations',
  'event-speakers',
  'posts',
  'uploads',
  'system',
  'auth',
]

const EXTRA_CONTROLLERS = {
  uploads: ['public-uploads.controller.ts'],
}

function read(p) {
  try {
    return fs.readFileSync(p, 'utf8')
  } catch {
    return null
  }
}

function extractRoutes(src) {
  const routes = []
  const lines = src.split('\n')
  let pendingVerb = null
  let pendingPath = null
  const handlerRe =
    /^\s*(?:(?:public|protected|private|override|async)\s+)*(\w+)\s*\(/

  for (const line of lines) {
    const dec = line.match(/@(Get|Post|Put|Delete|Patch)\(\s*(?:'([^']*)'|"([^"]*)")?\s*\)/)
    if (dec) {
      pendingVerb = dec[1].toUpperCase()
      pendingPath = dec[2] ?? dec[3] ?? ''
      continue
    }
    if (!pendingVerb) continue
    if (/^\s*@/.test(line)) continue

    const fn = line.match(handlerRe)
    if (fn && !['constructor', 'if', 'for', 'while', 'switch'].includes(fn[1])) {
      routes.push({ method: pendingVerb, path: pendingPath, handler: fn[1] })
      pendingVerb = null
      pendingPath = null
    }
  }
  return routes
}

function routeKey(r) {
  return `${r.method} ${r.path} → ${r.handler}`
}

const INHERITED_CRUD = {
  BaseAdminCrudController: 'common/crud/base-admin-crud.controller.ts',
  BaseCrudController: 'common/crud/base-crud.controller.ts',
}

const EXTRA_BASE_CONTROLLERS = {
  uploads: ['public-uploads.controller.ts'],
}

function listControllerFiles(moduleDir, { includePublic = false } = {}) {
  if (!fs.existsSync(moduleDir)) return []
  return fs.readdirSync(moduleDir).filter((f) => {
    if (!f.endsWith('.controller.ts') || f.includes('.spec.')) return false
    if (!includePublic && f.startsWith('public-')) return false
    return true
  })
}

function controllerPaths(baseDir, moduleId) {
  const dir = path.join(baseDir, moduleId)
  const files = listControllerFiles(dir)
  const out = files.map((f) => path.join(dir, f))
  for (const extra of EXTRA_CONTROLLERS[moduleId] ?? []) {
    const p = path.join(dir, extra)
    if (fs.existsSync(p)) out.push(p)
  }
  return out
}

function templateControllerPaths(templateSrcDir, moduleId) {
  const paths = new Set(controllerPaths(templateSrcDir, moduleId))
  const template = getTemplateForModuleId(moduleId)
  const packageDir = template?.packageDir ?? moduleId
  for (const sub of new Set([packageDir, moduleId])) {
    const baseDir = path.join(templateSrcDir, 'common/module-bases', sub)
    for (const f of listControllerFiles(baseDir)) {
      paths.add(path.join(baseDir, f))
    }
    for (const extra of EXTRA_BASE_CONTROLLERS[moduleId] ?? []) {
      const p = path.join(baseDir, extra)
      if (fs.existsSync(p)) paths.add(p)
    }
  }
  return [...paths]
}

function inheritedCrudRoutes(templateSrcDir, tplPaths) {
  const crudFiles = new Set()
  for (const p of tplPaths) {
    if (!p.includes('module-bases')) continue
    const src = read(p)
    if (!src) continue
    for (const [baseClass, relPath] of Object.entries(INHERITED_CRUD)) {
      if (src.includes(`extends ${baseClass}`)) {
        crudFiles.add(path.join(templateSrcDir, relPath))
      }
    }
  }
  return mergeRoutesFromFiles([...crudFiles])
}

function mergeRoutesFromFiles(filePaths) {
  const routes = []
  for (const filePath of filePaths) {
    const src = read(filePath)
    if (src) routes.push(...extractRoutes(src))
  }
  return routes
}

let failed = 0

for (const moduleId of UNIFIED) {
  const mainPaths = controllerPaths(path.join(ROOT, 'apps/main/api/src'), moduleId)
  const tplPaths = templateControllerPaths(TEMPLATE_SRC, moduleId)

  if (mainPaths.length === 0 || tplPaths.length === 0) {
    console.warn(`[parity] skip ${moduleId}: missing controller`)
    continue
  }

  const mainRoutes = mergeRoutesFromFiles(mainPaths)
  const tplRoutes = [
    ...mergeRoutesFromFiles(tplPaths),
    ...inheritedCrudRoutes(TEMPLATE_SRC, tplPaths),
  ]
  const tplKeys = new Set(tplRoutes.map(routeKey))
  const mainKeys = new Set(mainRoutes.map(routeKey))
  const missingInTpl = [...mainKeys].filter((k) => !tplKeys.has(k))
  const extraInTpl = [...tplKeys].filter((k) => !mainKeys.has(k))

  if (missingInTpl.length) {
    failed++
    console.error(`\n[parity] ${moduleId} MISMATCH`)
    console.error('  missing in template:', missingInTpl.join(', '))
    if (extraInTpl.length) {
      console.warn('  extra in template (ignored):', extraInTpl.join(', '))
    }
  } else if (extraInTpl.length) {
    console.log(`[parity] ${moduleId} OK (${mainRoutes.length} routes, +${extraInTpl.length} extra)`)
  } else {
    console.log(`[parity] ${moduleId} OK (${mainRoutes.length} routes)`)
  }
}

if (failed) {
  console.error(`\n[parity] ${failed} module(s) failed`)
  process.exit(1)
}

console.log('\n[parity] template routes match apps/main/api')
