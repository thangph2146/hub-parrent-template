/**
 * Format TypeScript snippets cho output AUTO-GENERATED (Prettier hub-event/api).
 */

function splitExportNames(spec) {
  if (Array.isArray(spec)) return spec.filter(Boolean)
  return String(spec || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function formatExportTypeFrom(names, fromModule) {
  const items = splitExportNames(names)
  if (items.length === 0) return ''
  if (items.length === 1) {
    return `export type { ${items[0]} } from '${fromModule}';\n`
  }
  return `export type {\n  ${items.join(',\n  ')},\n} from '${fromModule}';\n`
}

function formatNamedImport(names) {
  const items = splitExportNames(names)
  if (items.length === 0) return '{}'
  if (items.length === 1) return `{ ${items[0]} }`
  return `{\n  ${items.join(',\n  ')},\n}`
}

function formatStringArrayLiteral(values) {
  const items = splitExportNames(values)
  if (items.length === 0) return '[]'
  return `[${items.map((v) => `'${v}'`).join(', ')}]`
}

function injectConstructorParam(paramDecl) {
  const trimmed = paramDecl.trim()
  const match = trimmed.match(/^(\w+)\s*:\s*(.+)$/)
  if (!match) return trimmed
  const typeName = match[2].trim()
  return `@Inject(${typeName}) ${match[1]}: ${typeName}`
}

function formatExtendControllerConstructor(serviceClass, serviceVar, def) {
  const extraParams = def.controllerExtend?.extraConstructorParams ?? []
  const extraArgs = def.controllerExtend?.extraConstructorArgs ?? []
  const params = [
    `@Inject(${serviceClass}) ${serviceVar}: ${serviceClass}`,
    ...extraParams.map(injectConstructorParam),
  ]
  const superArgs = [serviceVar, ...extraArgs].join(', ')

  if (params.length === 1) {
    return `  constructor(${params[0]}) {
    super(${superArgs});
  }`
  }

  return `  constructor(
${params.map((p) => `    ${p},`).join('\n')}
  ) {
    super(${superArgs});
  }`
}

module.exports = {
  splitExportNames,
  formatExportTypeFrom,
  formatNamedImport,
  formatStringArrayLiteral,
  formatExtendControllerConstructor,
  injectConstructorParam,
}
