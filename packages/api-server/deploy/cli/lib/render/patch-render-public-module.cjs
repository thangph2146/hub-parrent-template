/**
 * Partial render: gỡ dependency public → module đã exclude (admission-results, page-contents, …).
 */
const fs = require('node:fs')
const path = require('node:path')
const { createLogger } = require('../cli-logger.cjs')

/** Module exclude → cắt khỏi PublicModule / PublicController. */
const PUBLIC_EXCLUDED_DEPS = {
  'admission-results': {
    moduleImport: /import \{ AdmissionResultsModule \} from '\.\.\/admission-results\/admission-results\.module';\n/g,
    moduleRef: /^\s+AdmissionResultsModule,\n/m,
    serviceImport:
      /import \{ AdmissionResultsService \} from '\.\.\/admission-results\/admission-results\.service';\n/g,
    constructorParam:
      /^\s+private readonly admissionResultsService: AdmissionResultsService,\n/m,
    routeBlock:
      /\n\s+@Get\('admission-results\/lookup'\)[\s\S]*?(?=\n\s+@(?:Get|Post)\()/m,
  },
  'page-contents': {
    moduleImport: /import \{ PageContentsModule \} from '\.\.\/page-contents\/page-contents\.module';\n/g,
    moduleRef: /^\s+PageContentsModule,\n/m,
    serviceImport:
      /import \{ PageContentsService \} from '\.\.\/page-contents\/page-contents\.service';\n/g,
    constructorParam: /^\s+private readonly pageContentsService: PageContentsService,\n/m,
    routeBlock:
      /\n\s+@Get\('page-contents\/:pageKey'\)[\s\S]*?(?=\n\s+@(?:Get|Post)\()/m,
  },
}

function applyPublicPatches(content, excludedModules) {
  let out = content.replace(/\r\n/g, '\n')
  for (const moduleId of excludedModules) {
    const rules = PUBLIC_EXCLUDED_DEPS[moduleId]
    if (!rules) continue
    for (const pattern of Object.values(rules)) {
      out = out.replace(pattern, '')
    }
  }
  return out
}

function patchRenderPublicModule(appRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const excludedModules = new Set(options.excludeModules ?? [])
  const relevant = [...excludedModules].filter((id) => PUBLIC_EXCLUDED_DEPS[id])
  if (!relevant.length) return false

  const publicDir = path.join(appRoot, 'src', 'public')
  const targets = ['public.module.ts', 'public.controller.ts']
  let changed = 0

  for (const file of targets) {
    const filePath = path.join(publicDir, file)
    if (!fs.existsSync(filePath)) continue
    const prev = fs.readFileSync(filePath, 'utf8')
    const next = applyPublicPatches(prev, relevant)
    if (next !== prev) {
      fs.writeFileSync(filePath, next, 'utf8')
      changed += 1
    }
  }

  if (changed) {
    log.step(
      'render:public-module',
      `gỡ dependency → ${relevant.join(', ')}`,
    )
  }
  return changed > 0
}

module.exports = { patchRenderPublicModule, PUBLIC_EXCLUDED_DEPS }
