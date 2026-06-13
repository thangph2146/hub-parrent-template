/**

 * Đối chiếu route handler (METHOD + path suffix) giữa apps/main/api và packages/api-server.

 * Usage: node script-system/api/verify-main-api-endpoint-parity.mjs

 */

import fs from 'node:fs'

import path from 'node:path'

import { fileURLToPath } from 'node:url'



const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')



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



/** Module có nhiều controller (admin + public). */

const EXTRA_PKG_CONTROLLERS = {

  uploads: ['public-uploads.controller.ts'],

}



const CRUD_BASE_HANDLERS = [

  { method: 'GET', path: '/', handler: 'list' },

  { method: 'DELETE', path: '/:id', handler: 'softDelete' },

  { method: 'POST', path: '/:id/restore', handler: 'restore' },

  { method: 'DELETE', path: '/:id/hard-delete', handler: 'hardDelete' },

  { method: 'POST', path: '/bulk', handler: 'bulk' },

]



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



  for (let i = 0; i < lines.length; i++) {

    const line = lines[i]

    const dec = line.match(

      /@(Get|Post|Put|Delete|Patch)\(\s*(?:'([^']*)'|"([^"]*)")?\s*\)/,

    )

    if (dec) {

      pendingVerb = dec[1].toUpperCase()

      pendingPath = dec[2] ?? dec[3] ?? ''

      continue

    }

    const fn = line.match(/^\s*(?:async\s+)?(\w+)\s*\(/)

    if (pendingVerb && fn && !['constructor', 'if', 'for', 'while', 'switch'].includes(fn[1])) {

      const handler = fn[1]

      if (

        !handler.startsWith('handle') &&

        !['buildListParams', 'buildErrorDetails'].includes(handler)

      ) {

        const norm =

          pendingPath === '' || pendingPath === undefined

            ? '/'

            : `/${String(pendingPath).replace(/^\//, '')}`

        routes.push({ method: pendingVerb, path: norm, handler })

      }

      pendingVerb = null

      pendingPath = null

    }

  }

  return routes

}



function routeKey(r) {

  return `${r.method} ${r.path}`

}



function listControllerFiles(moduleDir) {

  if (!fs.existsSync(moduleDir)) return []

  return fs

    .readdirSync(moduleDir)

    .filter((f) => f.endsWith('.controller.ts') && !f.includes('.spec.'))

}



function mainControllerPaths(moduleId) {

  const dir = path.join(ROOT, 'apps/main/api/src', moduleId)

  const files = listControllerFiles(dir)

  if (files.length === 0) return []

  return files.map((f) => path.join(dir, f))

}



function pkgControllerPaths(moduleId) {

  const dir = path.join(ROOT, 'packages/api-server/src/modules', moduleId)

  const unified = path.join(dir, `${moduleId}.controller.ts`)

  const out = []

  if (fs.existsSync(unified)) out.push(unified)

  for (const extra of EXTRA_PKG_CONTROLLERS[moduleId] ?? []) {

    const p = path.join(dir, extra)

    if (fs.existsSync(p)) out.push(p)

  }

  return out

}



function mergeRoutesFromFiles(filePaths, srcReader) {

  const routes = []

  for (const filePath of filePaths) {

    const src = srcReader(filePath)

    if (!src) continue

    routes.push(...extractRoutes(src))

  }

  return routes

}



/** Controller mỏng extend package — route nằm trên Base*Controller. */

function isThinPackageExtendController(src) {

  if (!src) return false

  if (!/extends\s+(Base\w+|Package\w+Controller)/.test(src)) return false

  return !/@(Get|Post|Put|Delete|Patch)\(\s*/.test(src)

}



let failed = 0



for (const moduleId of UNIFIED) {

  const mainPaths = mainControllerPaths(moduleId)

  const pkgPaths = pkgControllerPaths(moduleId)

  if (mainPaths.length === 0 || pkgPaths.length === 0) {

    console.warn(`[parity] skip ${moduleId}: missing controller file`)

    continue

  }



  let mainRoutes = mergeRoutesFromFiles(mainPaths, read)

  const mainSrc = read(mainPaths[0] ?? '')

  if (isThinPackageExtendController(mainSrc)) {

    mainRoutes = mergeRoutesFromFiles(pkgPaths, read)

  }



  let pkgRoutes = mergeRoutesFromFiles(pkgPaths, read)



  const pkgUnifiedSrc = read(pkgPaths[0] ?? '')

  if (pkgUnifiedSrc?.includes('BaseAdminCrudController')) {

    const own = new Set(pkgRoutes.map((r) => r.handler))

    for (const base of CRUD_BASE_HANDLERS) {

      if (!own.has(base.handler)) pkgRoutes.push({ ...base })

    }

  }



  const mainKeys = new Set(mainRoutes.map(routeKey))

  const pkgKeys = new Set(pkgRoutes.map(routeKey))



  const missingInPkg = [...mainKeys].filter((k) => !pkgKeys.has(k))

  const extraInPkg = [...pkgKeys].filter((k) => !mainKeys.has(k))



  if (missingInPkg.length || extraInPkg.length) {

    failed++

    console.error(`\n[parity] ${moduleId} MISMATCH`)

    if (missingInPkg.length) {

      console.error('  missing in @workspace/api-server:', missingInPkg.join(', '))

    }

    if (extraInPkg.length) {

      console.error('  extra in @workspace/api-server:', extraInPkg.join(', '))

    }

  } else {

    console.log(`[parity] ${moduleId} OK (${mainRoutes.length} routes)`)

  }

}



if (failed) {

  console.error(`\n[parity] ${failed} module(s) failed`)

  process.exit(1)

}



console.log('\n[parity] all unified modules match apps/main/api routes')

