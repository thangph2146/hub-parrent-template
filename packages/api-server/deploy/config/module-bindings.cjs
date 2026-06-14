/**
 * Phân loại module template — kế thừa local trong src/common/crud.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../cli/lib/monorepo-root.cjs')
const { MAIN_API_PATH } = require('./product-lines.cjs')

/** Giữ nguyên folder mirror từ main/api (multi-file / logic đặc thù). */
const COPY_ONLY_MODULE_IDS = new Set([
  'public',
  'uploads',
  'proxy-image',
  'socket',
  'auth',
  'system',
])

function moduleIdToClassPrefix(moduleId) {
  return moduleId
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function mainModulePaths(moduleId) {
  const base = path.join(ROOT, MAIN_API_PATH, 'src', moduleId)
  return {
    service: path.join(base, `${moduleId}.service.ts`),
    controller: path.join(base, `${moduleId}.controller.ts`),
    module: path.join(base, `${moduleId}.module.ts`),
  }
}

function isComplexStandardAdminModule(moduleId) {
  const { service } = mainModulePaths(moduleId)
  if (!fs.existsSync(service)) return true
  const content = fs.readFileSync(service, 'utf8')
  // Chỉ bỏ qua khi constructor inject nhiều dependency (orders, …)
  if (/constructor\s*\(\s*[^)]*,/.test(content)) return true
  return false
}

function isStandardAdminCrudModule(moduleId) {
  const { service } = mainModulePaths(moduleId)
  if (!fs.existsSync(service)) return false
  if (isComplexStandardAdminModule(moduleId)) return false
  const content = fs.readFileSync(service, 'utf8')
  return (
    content.includes('buildStandardAdminWhere') &&
    content.includes('normalizePageLimit') &&
    content.includes('paginationMeta')
  )
}

const STANDARD_SERVICE_METHODS = new Set([
  'list',
  'getById',
  'create',
  'update',
  'softDelete',
  'restore',
  'hardDelete',
  'bulk',
])

const STANDARD_CONTROLLER_METHODS = new Set([
  'list',
  'getById',
  'create',
  'update',
  'softDelete',
  'restore',
  'hardDelete',
  'bulk',
  'options',
])

function findMemberBlock(source, startIdx) {
  const openParen = source.indexOf('(', startIdx)
  if (openParen < 0) return ''

  let idx = openParen
  let parenDepth = 0
  for (; idx < source.length; idx++) {
    const ch = source[idx]
    if (ch === '(') parenDepth++
    else if (ch === ')') {
      parenDepth--
      if (parenDepth === 0) {
        idx++
        break
      }
    }
  }

  const openBrace = source.indexOf('{', idx)
  if (openBrace < 0) return ''

  let depth = 0
  let endIdx = openBrace
  for (let i = openBrace; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) {
        endIdx = i
        break
      }
    }
  }

  let blockStart = startIdx
  while (blockStart > 0 && source[blockStart - 1] !== '\n') blockStart--
  while (blockStart > 0) {
    const prevLineEnd = blockStart - 2
    if (prevLineEnd < 0) break
    const prevLineStart = source.lastIndexOf('\n', prevLineEnd) + 1
    const line = source.slice(prevLineStart, blockStart).trim()
    if (!line || line.startsWith('//')) break
    if (/^(private|protected|public|async)\b/.test(line) || line.startsWith('@')) {
      blockStart = prevLineStart
    } else break
  }

  return source.slice(blockStart, endIdx + 1).trim()
}

function extractPrivateHelperMethods(serviceContent) {
  const body = extractClassBody(serviceContent)
  const blocks = []
  const re = /\n\s*(private|protected)\s+(?:async\s+)?(\w+)\s*\(/g
  let m
  while ((m = re.exec(body))) {
    const block = findMemberBlock(body, m.index + 1)
    if (block) blocks.push(block)
  }
  return blocks
}

function pickPopulateExpression(block) {
  if (!block) return null
  const spread = block.match(/populate:\s*(\[\.\.\.[A-Z_][\w]*\])/)
  if (spread) return spread[1]
  const arr = block.match(/populate:\s*(\[[^\]]+\])/)
  return arr?.[1] ?? null
}

function extractPopulateHooks(serviceContent) {
  const body = extractClassBody(serviceContent)
  const listBlock = extractMethodBody(body, 'list')
  const getBlock = extractMethodBody(body, 'getById')
  return {
    list: pickPopulateExpression(listBlock),
    getById: pickPopulateExpression(getBlock),
  }
}

function extractExtraServiceMethods(serviceContent) {
  const body = extractClassBody(serviceContent)
  const blocks = []
  for (const match of body.matchAll(/\basync\s+(\w+)\s*\(/g)) {
    const name = match[1]
    if (STANDARD_SERVICE_METHODS.has(name)) continue
    const lineStart = body.lastIndexOf('\n', match.index) + 1
    const lineEnd = body.indexOf('\n', match.index)
    const line = body.slice(lineStart, lineEnd === -1 ? body.length : lineEnd)
    if (/\b(private|protected)\b/.test(line)) continue
    const block = extractMethodBody(body, name)
    if (block) blocks.push(block)
  }
  return blocks
}

function extractExtraControllerMethods(controllerContent) {
  const blocks = []
  for (const match of controllerContent.matchAll(/\basync\s+(\w+)\s*\(/g)) {
    const name = match[1]
    if (STANDARD_CONTROLLER_METHODS.has(name)) continue
    const block = extractDecoratedMethod(controllerContent, name)
    if (block) blocks.push(transformAuthAndResponse(block))
  }
  return blocks
}

function extractEntityBinding(serviceContent) {
  const match = serviceContent.match(
    /import\s*\{\s*(\w+)\s*\}\s*from\s*'\.\.\/entities\/([^']+)'/,
  )
  if (!match) return null
  return { className: match[1], importPath: `../entities/${match[2]}` }
}

function extractColumnFiltersImport(serviceContent) {
  const match = serviceContent.match(
    /import\s*\{\s*(\w+)\s*\}\s*from\s*'(?:\.\/(?:[\w-]+-column-filters)|\.\.\/common\/admin-filter-configs)'/,
  )
  return match ? match[1] : null
}

function extractSearchFields(serviceContent) {
  const match = serviceContent.match(/searchFields:\s*\[([^\]]+)\]/)
  if (!match) return ['name']
  return match[1]
    .split(',')
    .map((s) => s.replace(/['"\s]/g, ''))
    .filter(Boolean)
}

function extractEntityLabel(serviceContent, moduleId) {
  const bulk = serviceContent.match(/label:\s*['"]([^'"]+)['"]/)
  if (bulk?.[1]) return bulk[1]
  return moduleId.replace(/-/g, ' ')
}

function extractPreamble(serviceContent) {
  const idx = serviceContent.search(/@Injectable\(\)\s*\nexport class/)
  if (idx <= 0) return ''
  return serviceContent.slice(0, idx).trimEnd()
}

function extractClassBody(source) {
  const match = source.match(/export class \w+[^{]*\{([\s\S]*)\n\}\s*$/)
  return match ? match[1] : ''
}

function findMethodBlock(source, methodName, { fromDecorators = false } = {}) {
  const re = new RegExp(`\\basync\\s+${methodName}\\s*\\(`)
  const m = re.exec(source)
  if (!m) return ''

  let idx = m.index + m[0].length - 1
  let parenDepth = 0
  for (; idx < source.length; idx++) {
    const ch = source[idx]
    if (ch === '(') parenDepth++
    else if (ch === ')') {
      parenDepth--
      if (parenDepth === 0) {
        idx++
        break
      }
    }
  }

  const openBrace = source.indexOf('{', idx)
  if (openBrace < 0) return ''

  let depth = 0
  let endIdx = openBrace
  for (let i = openBrace; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) {
        endIdx = i
        break
      }
    }
  }

  let blockStart = m.index
  if (fromDecorators) {
    blockStart = source.lastIndexOf('\n', m.index) + 1
    while (blockStart > 0) {
      const prevLineEnd = blockStart - 2
      if (prevLineEnd < 0) break
      const prevLineStart = source.lastIndexOf('\n', prevLineEnd) + 1
      const line = source.slice(prevLineStart, blockStart).trim()
      if (line.startsWith('@')) blockStart = prevLineStart
      else break
    }
  }

  return source.slice(blockStart, endIdx + 1).trim()
}

function extractMethodBody(classBody, methodName) {
  return findMethodBlock(classBody, methodName, { fromDecorators: false })
}

function extractDecoratedMethod(source, methodName) {
  return findMethodBlock(source, methodName, { fromDecorators: true })
}

function hasBulkLabelOverride(serviceContent) {
  const body = extractMethodBody(extractClassBody(serviceContent), 'bulk')
  return body.includes('label:')
}

function extractTypeNames(preamble) {
  const rowDto = preamble.match(/export interface (\w+RowDto)/)?.[1] ?? null
  const listParams =
    preamble.match(/export interface (List\w+Params)/)?.[1] ??
    'StandardAdminListParams'
  const listResult =
    preamble.match(/export interface (List\w+Result)/)?.[1] ??
    (rowDto ? `StandardAdminListResult<${rowDto}>` : 'StandardAdminListResult<Record<string, unknown>>')
  return { rowDto, listParams, listResult }
}

function extractControllerHeader(controllerContent) {
  const end = controllerContent.search(/export class/)
  return controllerContent.slice(0, end).trimEnd()
}

function cleanControllerHeader(header, moduleId, serviceClass) {
  let body = header
    .replace(/(\n@[\w.()[\s,'"_\-[\]:]+)+\s*$/m, '')
    .replace(new RegExp(`import\\s*\\{\\s*${serviceClass}\\s*\\}[^;]+;\\n?`), '')
    .replace(/import\s*\{\s*\}\s*from[^;]+;\n?/g, '')
    .trimEnd()

  const lines = body.split('\n')
  const dropImport = (line) =>
    /createSuccessResponse|createErrorResponse|parseAdminListLimit|parseColumnFiltersFromQuery|BULK_ACTIONS|APP_HEADERS/.test(
      line,
    )
  const filtered = lines.filter((line) => !dropImport(line))
  const joined = filtered.join('\n').replace(/import\s*\{\s*\}\s*from[^;]+;\n?/g, '')

  return `${joined}
import { APP_HEADERS, ADMIN_ROUTES } from '../config/constants';
import { BaseAdminCrudController } from '../common/crud/base-admin-crud.controller';
import { ${serviceClass} } from './${moduleId}.service';
`
}

function transformAuthAndResponse(methodSource) {
  return methodSource
    .replace(
      /const userId = this\.getUserId\(headers\);\s*\n\s*if \(!userId\) return this\.unauthorized\(res\);/g,
      "const userId = this.requireUserId(res, headers);\n    if (typeof userId !== 'string') return userId;",
    )
    .replace(
      /if \(!this\.getUserId\(headers\)\) return this\.unauthorized\(res\);/g,
      "const userId = this.requireUserId(res, headers);\n    if (typeof userId !== 'string') return userId;",
    )
    .replace(
      /const \{ statusCode, body: ok(?:Body)? \} = createSuccessResponse\(([\s\S]*?)\);\s*\n\s*return res\.status\(statusCode\)\.json\(ok(?:Body)?\);/g,
      'return this.sendSuccess(res, $1);',
    )
    .replace(
      /const \{ statusCode, body: err(?:Body)? \} = createErrorResponse\(\s*([\s\S]*?)\s*\);\s*\n\s*return res\.status\(statusCode\)\.json\(err(?:Body)?\);/g,
      (_, args) => {
        const msgMatch = args.match(/^([^,]+),\s*\{\s*status:\s*(\d+)/)
        if (msgMatch) {
          return `return this.sendError(res, ${msgMatch[1].trim()}, ${msgMatch[2]});`
        }
        return `return this.sendError(res, ${args.trim()});`
      },
    )
    .replace(
      /const \{ statusCode, body \} = createSuccessResponse\(([\s\S]*?)\);\s*\n\s*return res\.status\(statusCode\)\.json\(body\);/g,
      'return this.sendSuccess(res, $1);',
    )
    .replace(
      /const \{ statusCode, body \} = createErrorResponse\(\s*([\s\S]*?)\s*\);\s*\n\s*return res\.status\(statusCode\)\.json\(body\);/g,
      (_, args) => {
        const msgMatch = args.match(/^([^,]+),\s*\{\s*status:\s*(\d+)/)
        if (msgMatch) {
          return `return this.sendError(res, ${msgMatch[1].trim()}, ${msgMatch[2]});`
        }
        return `return this.sendError(res, ${args.trim()});`
      },
    )
    .replace(/this\.(\w+Service)\./g, 'this.service.')
    .replace(/this\.service\.getById\(Number\(id\)\)/g, 'this.service.getById(id)')
}

function buildPermissionOverride(methodSource, methodName) {
  const decorators = (methodSource.match(/^((?:\s*@[^\n]+\n)+)/) ?? [''])[0].trimEnd()
  const permOnly = decorators
    .split('\n')
    .filter((l) => l.trim().startsWith('@Permissions'))
    .join('\n')
  if (!permOnly) return ''

  const routeDecorator = decorators
    .split('\n')
    .find((l) => /@(Get|Post|Put|Delete)\(/.test(l))
  const apiLines = decorators
    .split('\n')
    .filter((l) => l.trim().startsWith('@Api'))
    .join('\n')

  const params =
    methodName === 'bulk'
      ? `@Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Body() body: { action?: string; ids?: string[] }`
      : `@Res() res: Response,
    @Headers() headers: Record<string, string | undefined>,
    @Param('id') id: string`

  const superArgs =
    methodName === 'bulk' ? 'res, headers, body' : 'res, headers, id'

  return `${permOnly}
${apiLines}
${routeDecorator ?? ''}
  override ${methodName === 'bulk' ? 'async ' : ''}${methodName}(
    ${params}
  ) {
    return super.${methodName}(${superArgs});
  }`
}

function parseStandardAdminModule(moduleId) {
  const paths = mainModulePaths(moduleId)
  if (!fs.existsSync(paths.service) || !fs.existsSync(paths.controller)) return null

  const serviceContent = fs.readFileSync(paths.service, 'utf8')
  const controllerContent = fs.readFileSync(paths.controller, 'utf8')
  const entity = extractEntityBinding(serviceContent)
  if (!entity) return null

  const prefix = moduleIdToClassPrefix(moduleId)
  const preamble = extractPreamble(serviceContent)
  const types = extractTypeNames(preamble)
  if (!types.rowDto) return null

  const serviceBody = extractClassBody(serviceContent)
  const createMethod = extractMethodBody(serviceBody, 'create')
  const updateMethod = extractMethodBody(serviceBody, 'update')
  const bulkMethod = hasBulkLabelOverride(serviceContent)
    ? extractMethodBody(serviceBody, 'bulk')
    : ''

  const createCtrl = extractDecoratedMethod(controllerContent, 'create')
  const updateCtrl = extractDecoratedMethod(controllerContent, 'update')
  const optionsCtrl = extractDecoratedMethod(controllerContent, 'options')

  const permissionOverrides = ['softDelete', 'restore', 'hardDelete', 'bulk']
    .map((name) => {
      const src = extractDecoratedMethod(controllerContent, name)
      if (!src.includes('@Permissions')) return ''
      return buildPermissionOverride(src, name)
    })
    .filter(Boolean)

  return {
    moduleId,
    classPrefix: prefix,
    serviceClass: `${prefix}Service`,
    controllerClass: `${prefix}Controller`,
    entity,
    columnFilters: extractColumnFiltersImport(serviceContent),
    searchFields: extractSearchFields(serviceContent),
    entityLabel: extractEntityLabel(serviceContent, moduleId),
    preamble,
    types,
    createMethod,
    updateMethod,
    bulkMethod,
    serviceExtras: [
      ...extractPrivateHelperMethods(serviceContent),
      ...extractExtraServiceMethods(serviceContent),
    ],
    populateHooks: extractPopulateHooks(serviceContent),
    controllerHeader: extractControllerHeader(controllerContent),
    createCtrl: createCtrl ? transformAuthAndResponse(createCtrl) : '',
    updateCtrl: updateCtrl ? transformAuthAndResponse(updateCtrl) : '',
    optionsCtrl: optionsCtrl ? transformAuthAndResponse(optionsCtrl) : '',
    controllerExtras: extractExtraControllerMethods(controllerContent),
    permissionOverrides,
  }
}

function readMainModuleSource(moduleId) {
  const { module: modulePath } = mainModulePaths(moduleId)
  if (!fs.existsSync(modulePath)) return null
  return fs.readFileSync(modulePath, 'utf8')
}

function copyMainSpecs(moduleId, destDir) {
  const srcDir = path.join(ROOT, MAIN_API_PATH, 'src', moduleId)
  if (!fs.existsSync(srcDir)) return
  for (const name of fs.readdirSync(srcDir)) {
    if (!name.endsWith('.spec.ts')) continue
    fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name))
  }
}

module.exports = {
  COPY_ONLY_MODULE_IDS,
  MAIN_API_PATH,
  moduleIdToClassPrefix,
  mainModulePaths,
  isStandardAdminCrudModule,
  parseStandardAdminModule,
  readMainModuleSource,
  copyMainSpecs,
  cleanControllerHeader,
  findMemberBlock,
  extractDecoratedMethod,
  extractClassBody,
  extractPreamble,
}
