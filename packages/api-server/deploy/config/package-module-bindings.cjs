/**
 * Module kế thừa Base* từ packages/api-server/src/modules (vend → src/common/module-bases).
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../cli/lib/monorepo-root.cjs')
const { MAIN_API_PATH } = require('./product-lines.cjs')
const {
  findMemberBlock,
  extractDecoratedMethod,
  extractClassBody,
  copyMainSpecs,
  readMainModuleSource,
} = require('./module-bindings.cjs')
const { buildAllPackageBaseModules } = require('./auto-package-module-bindings.cjs')
const { PKG_MODULES, getTemplateForModuleId, resolveControllerPath } = require('./package-module-templates.cjs')
const { MANUAL_PACKAGE_MODULE_OVERRIDES } = require('./manual-package-module-overrides.cjs')

function readBaseControllerSrcForConfig(config, moduleId) {
  const template = getTemplateForModuleId(moduleId)
  const file = template?.primary?.controller?.file
  if (!file) return ''
  const abs = path.join(PKG_MODULES, config.packageDir, file)
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : ''
}

function extractMainConstructorParams(mainCtorBlock) {
  const idx = mainCtorBlock.indexOf('constructor(')
  if (idx < 0) return ''
  let depth = 0
  const start = idx + 'constructor('.length
  for (let i = start; i < mainCtorBlock.length; i++) {
    const ch = mainCtorBlock[i]
    if (ch === '(') depth++
    else if (ch === ')') {
      if (depth === 0) return mainCtorBlock.slice(start, i).trim()
      depth--
    }
  }
  return ''
}

function extractMainConstructorParamNames(params) {
  const cleaned = params.replace(/@\w+\([^)]*\)\s*/g, '')
  const names = [...cleaned.matchAll(/(?:private|protected|public)\s+(?:readonly\s+)?(\w+)\s*:/g)].map(
    (m) => m[1],
  )
  if (names.length) return names
  const plain = cleaned
    .split(',')
    .map((part) => part.trim().match(/^(\w+)\s*:/)?.[1])
    .filter(Boolean)
  if (plain.length) return plain
  return []
}

function extractSuperCall(src) {
  const idx = src.indexOf('super(')
  if (idx < 0) return null
  let depth = 0
  for (let i = idx + 6; i < src.length; i++) {
    const ch = src[i]
    if (ch === '(') depth++
    else if (ch === ')') {
      if (depth === 0) return `${src.slice(idx, i + 1)};`
      depth--
    }
  }
  return null
}

function buildAutoSuperCall(baseControllerSrc, mainParamNames) {
  const baseCtor = extractConstructorBlock(baseControllerSrc)
  const baseParams = extractMainConstructorParams(baseCtor)
  const baseParamNames = extractMainConstructorParamNames(baseParams)

  if (baseParamNames.length === 0) {
    return 'super();'
  }

  const args = baseParamNames.map((_, i) => mainParamNames[i] ?? baseParamNames[i]).join(', ')
  return `super(${args});`
}

function mergeImportsBySource(lines) {
  const valueBySource = new Map()
  const typeBySource = new Map()
  for (const line of lines) {
    const typeMatch = line.match(/import\s+type\s+\{([^}]+)\}\s+from\s+'([^']+)';/)
    if (typeMatch) {
      const src = typeMatch[2]
      const syms = typeMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      typeBySource.set(src, [...new Set([...(typeBySource.get(src) ?? []), ...syms])])
      continue
    }
    const valueMatch = line.match(/import\s+\{([^}]+)\}\s+from\s+'([^']+)';/)
    if (!valueMatch) continue
    const src = valueMatch[2]
    const syms = valueMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    valueBySource.set(src, [...new Set([...(valueBySource.get(src) ?? []), ...syms])])
  }
  const sources = [...new Set([...valueBySource.keys(), ...typeBySource.keys()])]
  return sources.flatMap((src) => {
    const chunks = []
    const valueSyms = valueBySource.get(src) ?? []
    const typeSyms = (typeBySource.get(src) ?? []).filter((sym) => !valueSyms.includes(sym))
    if (valueSyms.length) chunks.push(`import { ${valueSyms.join(', ')} } from '${src}';`)
    if (typeSyms.length) chunks.push(`import type { ${typeSyms.join(', ')} } from '${src}';`)
    return chunks
  })
}

function stripImportsFromPreamble(text) {
  let result = text
  for (const imp of extractImportStatements(text)) {
    result = result.replace(imp, '')
  }
  return result.replace(/^@Injectable\(\)\s*\n/gm, '').trim()
}

function extractImportStatements(preamble) {
  const cleaned = preamble.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\/\/.*$/gm, '')
  const out = []
  let i = 0
  while (i < cleaned.length) {
    const start = cleaned.indexOf('import ', i)
    if (start < 0) break
    let j = start + 7
    if (cleaned[j] === '{') {
      let depth = 0
      for (; j < cleaned.length; j++) {
        if (cleaned[j] === '{') depth++
        else if (cleaned[j] === '}') {
          depth--
          if (depth === 0) {
            j++
            break
          }
        }
      }
    }
    const semi = cleaned.indexOf(';', j)
    if (semi < 0) break
    out.push(cleaned.slice(start, semi + 1).trim())
    i = semi + 1
  }
  return out
}

function extractAutoControllerImports(mainControllerSrc, baseControllerSrc = '') {
  const baseIdx = baseControllerSrc.search(/export class \w+/)
  const basePreamble = baseIdx > 0 ? baseControllerSrc.slice(0, baseIdx) : ''
  const mainIdx = mainControllerSrc.search(/export class \w+/)
  const mainPreamble = mainIdx > 0 ? mainControllerSrc.slice(0, mainIdx) : ''

  const allow = (line) =>
    (/from '@nestjs\/(common|swagger)'/.test(line) ||
      /from '\.\.\/common\/permissions\.decorator'/.test(line) ||
      /from '\.\.\/config\/(permissions|constants)'/.test(line)) &&
    !/from '\.\/.+\.service'/.test(line) &&
    !/from '\.\.\/[^']+\.service'/.test(line)

  const merged = mergeImportsBySource(
    [...extractImportStatements(basePreamble), ...extractImportStatements(mainPreamble)]
      .filter(allow)
      .map((line) =>
        line.includes("@nestjs/common")
          ? "import { Controller } from '@nestjs/common';"
          : line,
      ),
  )

  const imports = [...merged]

  if (!imports.some((l) => l.includes('@nestjs/common'))) {
    imports.unshift("import { Controller } from '@nestjs/common';")
  }
  if (/@ApiTags/.test(mainControllerSrc) && !imports.some((l) => l.includes('swagger'))) {
    imports.push("import { ApiTags } from '@nestjs/swagger';")
  }
  if (/@Permissions/.test(mainControllerSrc) && !imports.some((l) => l.includes('permissions.decorator'))) {
    imports.push("import { Permissions } from '../common/permissions.decorator';")
  }
  if (/PERMISSIONS\./.test(mainControllerSrc) && !imports.some((l) => l.includes('config/permissions'))) {
    imports.push("import { PERMISSIONS } from '../config/permissions';")
  }
  if (/ADMIN_ROUTES\./.test(mainControllerSrc) && !imports.some((l) => l.includes('config/constants'))) {
    imports.push("import { ADMIN_ROUTES } from '../config/constants';")
  }
  return imports.join('\n')
}

function getPackageBaseModules() {
  return buildAllPackageBaseModules()
}

function mainModulePaths(moduleId) {
  const base = path.join(ROOT, MAIN_API_PATH, 'src', moduleId)
  const override = MANUAL_PACKAGE_MODULE_OVERRIDES[moduleId]
  const controller =
    resolveControllerPath(moduleId) ??
    path.join(base, override?.controllerFile ?? `${moduleId}.controller.ts`)
  return {
    service: path.join(base, `${moduleId}.service.ts`),
    controller,
    module: path.join(base, `${moduleId}.module.ts`),
  }
}

function extractConstructorBlock(controllerContent) {
  const body = extractClassBody(controllerContent)
  const idx = body.search(/\bconstructor\s*\(/)
  if (idx < 0) return ''
  return findMemberBlock(body, idx)
}

function extractPrivateMethods(controllerContent, names) {
  const body = extractClassBody(controllerContent)
  const blocks = []
  for (const name of names) {
    const re = new RegExp(`\\n\\s*private\\s+(?:async\\s+)?${name}\\s*\\(`)
    const m = re.exec(body)
    if (!m) continue
    const block = findMemberBlock(body, m.index + 1)
    if (block) blocks.push(block)
  }
  return blocks
}

function extractControllerImports(controllerContent) {
  const idx = controllerContent.search(/export class \w+/)
  if (idx <= 0) return ''
  let preamble = controllerContent.slice(0, idx).trimEnd()
  preamble = preamble.replace(
    /^export class (CreateUserDto|UpdateUserDto|BulkActionDto)[\s\S]*?(?=^import |^\/\*\*|^export class \w+Controller|^@)/m,
    '',
  )
  preamble = preamble.replace(/^type BulkAction =[^\n]+\n\n?/m, '')
  preamble = preamble.replace(
    new RegExp(`import\\s*\\{\\s*UsersService\\s*\\}[^;]+;\\n?`, 'g'),
    '',
  )
  return preamble.trimEnd()
}

function cleanPackageControllerHeader(header, moduleId, serviceClass) {
  return header
    .replace(/(\n@[\w.()[\s,'"_\-[\]:]+)+\s*$/m, '')
    .replace(/import\s*\{\s*\}\s*from[^;]+;\n?/g, '')
    .trimEnd()
}

function transformUserOverrideMethod(block, methodName) {
  let code = block.replace(/\basync\s+(\w+)\s*\(/, 'override async $1(')

  code = code.replace(
    /@Headers\(\)\s*headers:\s*Record<string,\s*string\s*\|\s*undefined>/g,
    "@Headers('x-user-id') userIdHeader?: string",
  )
  code = code.replace(
    /const userId = this\.getUserId\(headers\);/g,
    'const userId = userIdHeader?.trim() || null;',
  )
  code = code.replace(/@Param\('id'\)\s*id:\s*string/g, "@Param('id') id?: string")

  if (methodName === 'create') {
    code = code.replace(
      /@Body\(\)\s*\n?\s*body:\s*\{[\s\S]*?\},/,
      '@Body() body?: Partial<CreateUserDto>,',
    )
  }
  if (methodName === 'update') {
    code = code.replace(
      /@Body\(\)\s*\n?\s*body:\s*\{[\s\S]*?\},/,
      '@Body() body?: Partial<UpdateUserDto>,',
    )
  }
  if (methodName === 'bulk') {
    code = code.replace(
      /@Body\(\)\s*\n?\s*body:\s*\{[\s\S]*?\},/,
      '@Body() body?: BulkActionDto,',
    )
    code = code.replace(
      /const result = await this\.service\.bulk\(([\s\S]*?)\);/,
      "const result = (await this.service.bulk($1)) as import('../common/module-bases/users/users.service').UserBulkResult;",
    )
  }

  if (!/\):\s*Promise<Response>/.test(code)) {
    code = code.replace(/\)\s*\{/, '): Promise<Response> {')
  }

  code = code.replace(
    /this\.service\.(update|softDelete|restore|hardDelete)\(\s*id\s*,/g,
    'this.service.$1(id!,',
  )
  code = code.replace(
    /this\.service\.(softDelete|restore|hardDelete)\(\s*id\s*\)/g,
    'this.service.$1(id!)',
  )

  return code
}

function parsePackageModuleBinding(moduleId, config) {
  const { controller, service } = mainModulePaths(moduleId)
  if (!fs.existsSync(controller) || !fs.existsSync(service)) {
    return null
  }
  const controllerSrc = fs.readFileSync(controller, 'utf8')
  const serviceSrc = fs.readFileSync(service, 'utf8')

  const constructorBlock = extractConstructorBlock(controllerSrc)
  const privateHelpers = extractPrivateMethods(
    controllerSrc,
    config.controllerPrivateHelpers ?? [],
  )
  const overrideMethods = (config.controllerOverrideMethods ?? [])
    .map((name) => extractDecoratedMethod(controllerSrc, name))
    .filter(Boolean)
    .map((block) => block.replace(/\bthis\.usersService\b/g, 'this.service'))
    .map((block, i) =>
      moduleId === 'users'
        ? transformUserOverrideMethod(block, config.controllerOverrideMethods[i])
        : block,
    )

  const controllerImports = extractControllerImports(controllerSrc)
  const moduleSrc = readMainModuleSource(moduleId)

  let constructorWithSuper = constructorBlock.replace(
    /\bprivate readonly usersService\b/,
    'usersService',
  )
  if (constructorWithSuper && !/\bsuper\s*\(/.test(constructorWithSuper)) {
    constructorWithSuper = constructorWithSuper.replace(
      /\)\s*\{\s*\}/,
      ') {\n    super(usersService);\n  }',
    )
    constructorWithSuper = constructorWithSuper.replace(
      /\)\s*\{\s*$/,
      ') {\n    super(usersService);\n  }',
    )
    if (!/\bsuper\s*\(/.test(constructorWithSuper)) {
      constructorWithSuper = constructorWithSuper.replace(
        /\)\s*\{/,
        ') {\n    super(usersService);',
      )
    }
  }

  return {
    moduleId,
    config,
    serviceSrc,
    controllerSrc,
    controllerImports,
    constructorBlock: constructorWithSuper,
    privateHelpers,
    overrideMethods,
    moduleSrc,
    baseControllerSrc: readBaseControllerSrcForConfig(config, moduleId),
  }
}

function splitConstructorParams(params) {
  const parts = []
  let current = ''
  let depth = 0
  for (const ch of params) {
    if (ch === '<' || ch === '(' || ch === '{') depth++
    else if (ch === '>' || ch === ')' || ch === '}') depth--
    else if (ch === ',' && depth === 0) {
      if (current.trim()) parts.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function buildAutoControllerParamsFromBase(meta) {
  const baseSrc = meta.baseControllerSrc ?? ''
  const baseParams = extractMainConstructorParams(extractConstructorBlock(baseSrc))
  if (!baseParams.trim()) {
    return `service: ${meta.config.serviceClass}`
  }

  return splitConstructorParams(baseParams)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const cleaned = part.replace(/\b(?:private|protected|public)\s+(?:readonly\s+)?/g, '')
      const name = cleaned.match(/^(\w+)\s*:/)?.[1] ?? 'service'
      if (/attendanceService/i.test(name)) {
        return `${name}: EventRegistrationAttendanceService`
      }
      if (/uploadsService/i.test(name)) {
        return `${name}: UploadsService`
      }
      if (/notificationsService/i.test(name)) {
        return `${name}: NotificationsService`
      }
      if (/socketGateway/i.test(name)) {
        return `${name}: SocketGateway`
      }
      if (name === 'service' || /Service$/i.test(name)) {
        return `${name}: ${meta.config.serviceClass}`
      }
      return cleaned
    })
    .join(',\n    ')
}

function buildSuperFromCtorParams(ctorParams) {
  const names = extractMainConstructorParamNames(ctorParams)
  return names.length ? `super(${names.join(', ')});` : 'super();'
}

function prependMissingImports(headerImports, extraImports) {
  if (!extraImports?.length) return headerImports
  const toAdd = extraImports.filter((line) => {
    const symbols =
      line.match(/\{([^}]+)\}/)?.[1]?.split(',').map((s) => s.trim().replace(/^type\s+/, '')) ??
      []
    if (!symbols.length) return !headerImports.includes(line)
    return symbols.some((sym) => {
      const name = sym.split(/\s+as\s+/)[0]?.trim()
      return name && !new RegExp(`\\b${name}\\b`).test(headerImports)
    })
  })
  return [...toAdd, headerImports].filter(Boolean).join('\n')
}

function extractPreambleBeforeClass(src) {
  const idx = src.search(/export class \w+/)
  if (idx <= 0) return ''
  return src
    .slice(0, idx)
    .replace(/^import .+\n/gm, '')
    .replace(/^@Injectable\(\)\s*\n/gm, '')
    .trim()
}

function dedupeExactLines(text) {
  if (!text?.trim()) return ''
  const seen = new Set()
  const out = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && seen.has(trimmed)) continue
    if (trimmed) seen.add(trimmed)
    out.push(line)
  }
  return out.join('\n')
}

function findBodyBraceAfterSignature(source, closeParenIdx) {
  let i = closeParenIdx
  while (i < source.length && /\s/.test(source[i])) i++
  if (source[i] === ':') {
    i++
    let angles = 0
    for (; i < source.length; i++) {
      const ch = source[i]
      if (ch === '<') angles++
      else if (ch === '>' && angles > 0) angles--
      else if (ch === '{' && angles === 0) return i
    }
    return -1
  }
  if (source[i] === '{') return i
  return -1
}

function findMethodBlockRobust(source, methodName) {
  const re = new RegExp(`(?:^|\\n)\\s*(?:async\\s+)?${methodName}\\s*\\(`)
  const m = re.exec(source)
  if (!m) return ''

  let i = m.index + m[0].length
  let parenDepth = 1
  for (; i < source.length; i++) {
    const ch = source[i]
    if (ch === '(') parenDepth++
    else if (ch === ')') {
      parenDepth--
      if (parenDepth === 0) {
        const bodyStart = findBodyBraceAfterSignature(source, i + 1)
        if (bodyStart < 0) return ''
        let depth = 0
        for (let j = bodyStart; j < source.length; j++) {
          if (source[j] === '{') depth++
          else if (source[j] === '}') {
            depth--
            if (depth === 0) {
              const lineStart = source.lastIndexOf('\n', m.index) + 1
              return source.slice(lineStart, j + 1).trim()
            }
          }
        }
        return ''
      }
    }
  }
  return ''
}

function extractClassMethods(src, methodNames, renameMethods = {}) {
  const body = extractClassBody(src)
  const blocks = []
  for (const name of methodNames) {
    const sourceName = renameMethods[name] ?? name
    const block = findMethodBlockRobust(body, sourceName)
    if (!block) continue
    const renamed =
      sourceName !== name
        ? block.replace(new RegExp(`\\b${sourceName}\\s*\\(`, 'm'), `${name}(`)
        : block
    blocks.push(`  ${renamed.replace(/\n/g, '\n  ')}`)
  }
  return blocks.join('\n\n')
}

function stripTypeReExportsFromPreamble(preamble, typeNames) {
  if (!preamble?.trim() || !typeNames?.length) return preamble
  const names = new Set(typeNames)
  return preamble
    .replace(/export type \{([^}]+)\} from '[^']+';?\n/g, (block, inner) => {
      const syms = inner
        .split(',')
        .map((s) => s.trim().split(/\s+/)[0])
        .filter(Boolean)
      if (syms.length && syms.every((s) => names.has(s))) return ''
      return block
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function buildServiceExtensionBlock(meta) {
  const ext = meta.config.serviceExtensions
  if (!ext?.methods?.length) return { preamble: '', methods: '', imports: '', constructorExtra: '' }

  const typeNames = meta.config.serviceTypeExports ?? []
  const rawPreamble = ext.includePreamble
    ? stripImportsFromPreamble(extractPreambleBeforeClass(meta.serviceSrc))
    : ''
  const preamble = ext.includePreamble
    ? stripTypeReExportsFromPreamble(rawPreamble, typeNames)
    : ''
  const methods = extractClassMethods(meta.serviceSrc, ext.methods, ext.renameMethods ?? {})
  const importLines = meta.serviceSrc.match(/^import .+;$/gm) ?? []
  const preambleSyms = `${preamble}\n${methods}`
  const usedImports = importLines.filter((line) => {
    const syms = line.match(/\{([^}]+)\}/)?.[1]?.split(',') ?? [line]
    return syms.some((sym) => {
      const name = sym.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]?.trim()
      if (!name) return false
      return new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(
        preambleSyms,
      )
    })
  })
  const existingImports = new Set([
    'Injectable',
    'EntityManager',
    meta.config.serviceClass,
    meta.config.baseServiceClass,
  ])
  const filteredImports = usedImports.filter((line) => {
    const syms = line.match(/\{([^}]+)\}/)?.[1]?.split(',') ?? []
    return syms.some((sym) => {
      const name = sym.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]?.trim()
      return name && !existingImports.has(name)
    })
  })

  return {
    preamble,
    methods,
    imports: [...filteredImports, ...(ext.extraImports ?? [])].join('\n'),
    constructorExtra: ext.extraConstructorParams ?? '',
    copySiblingFiles: ext.copySiblingFiles ?? [],
  }
}

function normalizeAutoConstructorParams(params, serviceClass) {
  if (!params) return `service: ${serviceClass}`
  return params
    .replace(/\bprivate readonly\s+/g, '')
    .replace(/\bprotected readonly\s+/g, '')
    .replace(/\bpublic readonly\s+/g, '')
    .replace(/,\s*\)/g, ')')
}

function renderPackageService(meta) {
  const { config } = meta
  if (config.customService) {
    return config.customService.replace(/\r\n/g, '\n')
  }
  const basePath = config.baseServiceImport ?? `../common/module-bases/${config.baseModuleSubpath}/${config.baseModuleSubpath}.service`
  const extBlock = buildServiceExtensionBlock(meta)
  const hooks = config.entityHooks
    .map(
      (h) => `  protected ${h.method}() {
    return ${h.entity} as unknown as new () => Record<string, unknown>;
  }`,
    )
    .join('\n\n')

  const entityImports = [...new Set(config.entityHooks.map((h) => h.entity))]
    .map((entity) => {
      const hook = config.entityHooks.find((h) => h.entity === entity)
      return `import { ${entity} } from '${hook.importPath}';`
    })
    .join('\n')

  const typeNames = config.serviceTypeExports ?? []
  const moduleTypeNames = config.serviceTypeExportsFromModuleTypes ?? []
  const hasTypeAliases = (config.serviceTypeAliases ?? []).length > 0
  const usersLimit =
    config.baseServiceClass === 'BaseUsersService'
      ? `\nexport { ADMIN_TABLE_EXPORT_MAX_LIMIT } from '${basePath}';\n`
      : ''

  const typeReExport = typeNames.length
    ? hasTypeAliases
      ? `import type { ${typeNames.join(', ')} } from '${basePath}';\nexport type { ${typeNames.join(', ')} };\n`
      : `export type { ${typeNames.join(', ')} } from '${basePath}';\n`
    : ''
  const moduleTypeReExport = moduleTypeNames.length
    ? hasTypeAliases
      ? `import type { ${moduleTypeNames.join(', ')} } from '../common/module-types';\nexport type { ${moduleTypeNames.join(', ')} };\n`
      : `export type { ${moduleTypeNames.join(', ')} } from '../common/module-types';\n`
    : ''

  const typeAliases = (config.serviceTypeAliases ?? [])
    .map((a) => `export type ${a.name} = ${a.type};`)
    .join('\n')

  const constImports = [...new Set((config.constHooks ?? []).map((h) => h.importName))]
    .map((name) => {
      const hook = (config.constHooks ?? []).find((h) => h.importName === name)
      return `import { ${name} } from '${hook.importPath}';`
    })
    .join('\n')

  const constHookBlock = (config.constHooks ?? [])
    .map(
      (h) => `  protected ${h.method}() {
    return ${h.returnExpr};
  }`,
    )
    .join('\n\n')

  const getEmBlock = `
  protected getEm(): EntityManager {
    return this.em;
  }
`

  const ctorParams = extBlock.constructorExtra
    ? `private readonly em: EntityManager,\n    ${extBlock.constructorExtra}`
    : 'private readonly em: EntityManager'

  meta.serviceExtensionCopyFiles = extBlock.copySiblingFiles

  const baseServiceImportLine = `import { ${config.baseServiceClass} } from '${basePath}';`

  const importBlock = mergeImportsBySource(
    dedupeExactLines(
      [
        "import { Injectable } from '@nestjs/common';",
        "import { EntityManager } from '@mikro-orm/core';",
        extBlock.imports,
        entityImports,
        constImports,
        baseServiceImportLine,
      ].join('\n'),
    )
      .split('\n')
      .filter((line) => line.trim().startsWith('import ')),
  ).join('\n')

  return `/** AUTO-GENERATED — extends ${config.baseServiceClass} (local module-bases). */
${importBlock}
${typeReExport}${moduleTypeReExport}${typeAliases ? `${typeAliases}\n` : ''}${usersLimit}${extBlock.preamble ? `\n${extBlock.preamble}\n` : ''}
@Injectable()
export class ${config.serviceClass} extends ${config.baseServiceClass} {
  constructor(${ctorParams}) {
    super();
  }
${getEmBlock}${constHookBlock ? `\n${constHookBlock}\n` : ''}${hooks ? `\n${hooks}\n` : ''}${extBlock.methods ? `\n${extBlock.methods}\n` : ''}}
`
}

function renderAutoPackageController(meta) {
  const { config, moduleId } = meta
  const mainCtor = extractConstructorBlock(meta.controllerSrc)
  const mainParams = extractMainConstructorParams(mainCtor)
  const mainParamNames = extractMainConstructorParamNames(mainParams)
  const baseParamNames = extractMainConstructorParamNames(
    extractMainConstructorParams(extractConstructorBlock(meta.baseControllerSrc ?? '')),
  )
  const imports = extractAutoControllerImports(meta.controllerSrc, meta.baseControllerSrc ?? '')
  const apiTags = meta.controllerSrc.match(/@ApiTags\([^)]+\)/)?.[0] ?? ''
  const controllerDec = meta.controllerSrc.match(/@Controller\([^)]+\)/)?.[0] ?? ''
  const permissionsDec = meta.controllerSrc.match(/@Permissions\([^)]+\)/)?.[0] ?? ''
  let ctorParams = config.controllerParams
  if (!ctorParams && config.autoController !== false) {
    ctorParams = buildAutoControllerParamsFromBase(meta)
  } else if (!ctorParams) {
    ctorParams = normalizeAutoConstructorParams(mainParams, config.serviceClass)
  }
  const superCall = config.controllerSuperCall ?? buildSuperFromCtorParams(ctorParams)
  let headerImports = dedupeExactLines(
    prependMissingImports(imports, config.controllerExtraImports),
  )
  if (/\buploadsService\b/.test(ctorParams) && moduleId !== 'uploads' && !/\bUploadsService\b/.test(headerImports)) {
    headerImports += "\nimport { UploadsService } from '../uploads/uploads.service';"
  }
  if (
    /\bnotificationsService\b/.test(ctorParams) &&
    moduleId !== 'notifications' &&
    !/\bNotificationsService\b/.test(headerImports)
  ) {
    headerImports += "\nimport { NotificationsService } from '../notifications/notifications.service';"
  }
  if (ctorParams.includes('SocketGateway') && !/\bSocketGateway\b/.test(headerImports)) {
    headerImports += "\nimport { SocketGateway } from '../socket/socket.gateway';"
  }
  if (ctorParams.includes('@Inject') || ctorParams.includes('forwardRef')) {
    headerImports = headerImports.replace(
      /import \{([^}]+)\} from '@nestjs\/common';/,
      (_, syms) => {
        const names = syms
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        if (ctorParams.includes('@Inject') && !names.includes('Inject')) names.push('Inject')
        if (ctorParams.includes('forwardRef') && !names.includes('forwardRef')) {
          names.push('forwardRef')
        }
        return `import { ${names.join(', ')} } from '@nestjs/common';`
      },
    )
  }

  return `/** AUTO-GENERATED — extends ${config.baseControllerClass} (local module-bases). */
${headerImports}
import { ${config.baseControllerClass} } from '${config.baseControllerImport}';
import { ${config.serviceClass} } from './${moduleId}.service';

${apiTags}
${permissionsDec}
${controllerDec}
export class ${config.controllerClass} extends ${config.baseControllerClass} {
  constructor(${ctorParams}) {
    ${superCall}
  }
}
`
}

function renderPackageController(meta) {
  const { config, moduleId } = meta
  if (config.customController) {
    return config.customController
  }
  if (config.autoController) {
    return renderAutoPackageController(meta)
  }
  const basePath = config.baseControllerImport ?? `../common/module-bases/${config.baseModuleSubpath}/${config.baseModuleSubpath}.controller`
  const header = cleanPackageControllerHeader(
    meta.controllerImports,
    moduleId,
    config.serviceClass,
  )

  const apiTags = meta.controllerSrc.match(/@ApiTags\([^)]+\)/)?.[0] ?? ''
  const controllerDec = meta.controllerSrc.match(/@Controller\([^)]+\)/)?.[0] ?? ''
  const permissionsDec = meta.controllerSrc.match(/@Permissions\([^)]+\)/)?.[0] ?? ''

  const dtoImport = (config.dtoImports ?? []).length
    ? `import { ${config.dtoImports.join(', ')} } from '${basePath}';\n`
    : ''

  const reExportDto = (config.dtoImports ?? []).length
    ? `\nexport { ${config.dtoImports.join(', ')} } from '${basePath}';\n`
    : ''

  const bulkActionType =
    moduleId === 'users'
      ? `\ntype BulkAction = 'delete' | 'restore' | 'hard-delete' | 'active' | 'unactive';\n`
      : ''

  const privateBlock = meta.privateHelpers.map((m) => `  ${m.replace(/\n/g, '\n  ')}`).join('\n\n')
  const overrideBlock = meta.overrideMethods.map((m) => `  ${m.replace(/\n/g, '\n  ')}`).join('\n\n')

  return `${header}
import { ${config.baseControllerClass} } from '${basePath}';
import { ${config.serviceClass} } from './${moduleId}.service';
${dtoImport}${reExportDto}${bulkActionType}
${apiTags}
${permissionsDec}
${controllerDec}
export class ${config.controllerClass} extends ${config.baseControllerClass} {
  ${meta.constructorBlock.replace(/\n/g, '\n  ')}

${privateBlock}

${overrideBlock}
}
`
}

module.exports = {
  getPackageBaseModules,
  parsePackageModuleBinding,
  renderPackageService,
  renderPackageController,
  renderAutoPackageController,
  copyMainSpecs,
}
