/**
 * Quét MikroORM entities + import entity trong module → graph closure.
 * Nguồn sự thật: apps/main/api (SOT).
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { MAIN_API_PATH } = require('../../../config/product-lines.cjs')

const ENTITY_IMPORT_RE =
  /import\s+\{([^}]+)\}\s+from\s+['"]\.\.?\/entities\/([^'"]+)['"]/g
const RELATION_RE =
  /@(ManyToOne|OneToMany|OneToOne|ManyToMany)\(\(\)\s*=>\s*(\w+)/g
const EXPORT_CLASS_RE = /export\s+class\s+(\w+)/
const UNIQUE_PROPERTIES_RE = /@Unique\(\{\s*properties:\s*\[([^\]]+)\]/g

/** Entity pivot / auth — luôn giữ khi closure chạm auth stack. */
const AUTH_STACK_CLASSES = new Set([
  'User',
  'Role',
  'UserRole',
  'Session',
  'Account',
  'VerificationToken',
])

function parseNamedImports(importBlock) {
  return importBlock
    .split(',')
    .map((part) => part.trim().replace(/^type\s+/, ''))
    .filter(Boolean)
}

function entityFileToClassName(fileStem) {
  const base = fileStem.replace(/\.entity$/, '')
  return base
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

function listEntityFiles(entitiesDir) {
  if (!fs.existsSync(entitiesDir)) return []
  return fs
    .readdirSync(entitiesDir)
    .filter((n) => n.endsWith('.entity.ts') && n !== 'base.entity.ts')
}

function parseUniquePropertySets(content) {
  const uniquePropertySets = []
  let m
  UNIQUE_PROPERTIES_RE.lastIndex = 0
  while ((m = UNIQUE_PROPERTIES_RE.exec(content))) {
    const properties = m[1]
      .split(',')
      .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
    if (properties.length) uniquePropertySets.push(properties)
  }
  return uniquePropertySets
}

function findDecoratorEnd(content, startIndex) {
  const openIndex = content.indexOf('(', startIndex)
  if (openIndex < 0) return startIndex

  let depth = 0
  let quote = null
  for (let i = openIndex; i < content.length; i += 1) {
    const ch = content[i]
    const prev = content[i - 1]
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '(') depth += 1
    if (ch === ')') {
      depth -= 1
      if (depth === 0) return i + 1
    }
  }
  return content.length
}

function parseRelationDetails(content) {
  const relationDetails = []
  let m
  RELATION_RE.lastIndex = 0
  while ((m = RELATION_RE.exec(content))) {
    const decoratorEnd = findDecoratorEnd(content, m.index)
    const decoratorBlock = content.slice(m.index, decoratorEnd)
    const propMatch = content.slice(decoratorEnd).match(/^\s*(\w+)[!?]?:/)
    const fieldNameMatch = decoratorBlock.match(/fieldName:\s*['"]([^'"]+)['"]/)
    relationDetails.push({
      kind: m[1],
      target: m[2],
      propertyName: propMatch?.[1] ?? null,
      fieldName: fieldNameMatch?.[1] ?? null,
      primary: /primary:\s*true/.test(decoratorBlock),
    })
  }
  return relationDetails
}

function isJoinEntity(relationDetails, uniquePropertySets) {
  const manyToOneProps = relationDetails
    .filter((rel) => rel.kind === 'ManyToOne' && rel.propertyName)
    .map((rel) => rel.propertyName)
  if (manyToOneProps.length < 2) return false

  const primaryCount = relationDetails.filter(
    (rel) => rel.kind === 'ManyToOne' && rel.primary,
  ).length
  if (primaryCount >= 2) return true

  return uniquePropertySets.some((set) => {
    const picked = set.filter((prop) => manyToOneProps.includes(prop))
    return picked.length >= 2
  })
}

function buildLinkRelations(joinEntities) {
  const links = []
  for (const joinEntity of joinEntities) {
    const joins = joinEntity.joins.filter((join) => join.target)
    for (let i = 0; i < joins.length; i += 1) {
      for (let j = i + 1; j < joins.length; j += 1) {
        const left = joins[i]
        const right = joins[j]
        links.push({
          left: left.target,
          right: right.target,
          via: joinEntity.className,
          viaFile: joinEntity.fileName,
          leftProperty: left.propertyName,
          rightProperty: right.propertyName,
          leftFieldName: left.fieldName,
          rightFieldName: right.fieldName,
          primary: Boolean(left.primary && right.primary),
          uniquePropertySets: joinEntity.uniquePropertySets,
        })
      }
    }
  }
  return links.sort((a, b) =>
    `${a.left}:${a.right}:${a.via}`.localeCompare(
      `${b.left}:${b.right}:${b.via}`,
    ),
  )
}

function parseEntityFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8')
  const classMatch = content.match(EXPORT_CLASS_RE)
  const className = classMatch?.[1] ?? entityFileToClassName(fileName)
  const relations = new Set()
  const uniquePropertySets = parseUniquePropertySets(content)
  const relationDetails = parseRelationDetails(content)

  let m
  RELATION_RE.lastIndex = 0
  while ((m = RELATION_RE.exec(content))) {
    relations.add(m[2])
  }

  return {
    className,
    fileName,
    relations: [...relations],
    relationDetails,
    uniquePropertySets,
    isJoinEntity: isJoinEntity(relationDetails, uniquePropertySets),
  }
}

function scanModuleEntityImports(apiRoot, moduleIds) {
  /** @type {Map<string, Set<string>>} */
  const moduleEntities = new Map()
  const srcDir = path.join(apiRoot, 'src')

  for (const moduleId of moduleIds) {
    const dir = path.join(srcDir, moduleId)
    if (!fs.existsSync(dir)) continue
    const set = moduleEntities.get(moduleId) ?? new Set()
    moduleEntities.set(moduleId, set)

    const stack = [dir]
    while (stack.length) {
      const current = stack.pop()
      for (const ent of fs.readdirSync(current, { withFileTypes: true })) {
        const abs = path.join(current, ent.name)
        if (ent.isDirectory()) {
          stack.push(abs)
          continue
        }
        if (!ent.name.endsWith('.ts')) continue
        const content = fs.readFileSync(abs, 'utf8')
        ENTITY_IMPORT_RE.lastIndex = 0
        let m
        while ((m = ENTITY_IMPORT_RE.exec(content))) {
          for (const imp of parseNamedImports(m[1])) {
            set.add(imp)
          }
        }
      }
    }
  }

  const out = {}
  for (const [k, v] of moduleEntities) {
    out[k] = [...v].sort()
  }
  return out
}

/**
 * @param {string} [apiRootRel]
 */
function buildEntityGraph(apiRootRel = MAIN_API_PATH) {
  const apiRoot = path.join(ROOT, apiRootRel)
  const entitiesDir = path.join(apiRoot, 'src', 'entities')
  const entityFiles = listEntityFiles(entitiesDir)

  /** @type {Record<string, { fileName: string, relations: string[], relationDetails: object[], uniquePropertySets: string[][], isJoinEntity: boolean }>} */
  const entities = {}

  for (const fileName of entityFiles) {
    const parsed = parseEntityFile(path.join(entitiesDir, fileName), fileName)
    entities[parsed.className] = {
      fileName: parsed.fileName,
      relations: parsed.relations.sort(),
      relationDetails: parsed.relationDetails,
      uniquePropertySets: parsed.uniquePropertySets,
      isJoinEntity: parsed.isJoinEntity,
    }
  }

  const srcDir = path.join(apiRoot, 'src')
  const moduleIds = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== 'common' && e.name !== 'entities')
    .map((e) => e.name)
    .sort()

  const moduleEntitiesRaw = scanModuleEntityImports(apiRoot, moduleIds)
  const known = new Set(Object.keys(entities))
  /** @type {Record<string, string[]>} */
  const moduleEntities = {}
  for (const [mod, ents] of Object.entries(moduleEntitiesRaw)) {
    moduleEntities[mod] = ents.filter((cls) => known.has(cls)).sort()
  }

  for (const row of Object.values(entities)) {
    row.relations = row.relations.filter((cls) => known.has(cls)).sort()
    row.relationDetails = row.relationDetails.filter((rel) =>
      known.has(rel.target),
    )
  }

  const relationEdgesFiltered = []
  const relationEdgesDetailed = []
  for (const [cls, row] of Object.entries(entities)) {
    for (const rel of row.relations) {
      relationEdgesFiltered.push([cls, rel])
    }
    for (const rel of row.relationDetails) {
      relationEdgesDetailed.push({
        from: cls,
        to: rel.target,
        kind: rel.kind,
        propertyName: rel.propertyName,
        fieldName: rel.fieldName,
        primary: rel.primary,
      })
    }
  }
  const joinEntities = Object.entries(entities)
    .filter(([, row]) => row.isJoinEntity)
    .map(([cls, row]) => ({
      className: cls,
      fileName: row.fileName,
      joins: row.relationDetails
        .filter((rel) => rel.kind === 'ManyToOne')
        .map((rel) => ({
          propertyName: rel.propertyName,
          target: rel.target,
          fieldName: rel.fieldName,
          primary: rel.primary,
        })),
      uniquePropertySets: row.uniquePropertySets,
    }))
    .sort((a, b) => a.className.localeCompare(b.className))
  const linkRelations = buildLinkRelations(joinEntities)

  return {
    source: apiRootRel,
    generatedAt: new Date().toISOString(),
    entityCount: entityFiles.length,
    entities,
    relationEdges: relationEdgesFiltered,
    relationEdgesDetailed,
    joinEntities,
    linkRelations,
    moduleEntities,
  }
}

function expandRelationClosure(seedClasses, entitiesMap) {
  const queue = seedClasses.filter((cls) => entitiesMap[cls])
  const seen = new Set(queue)

  while (queue.length) {
    const cls = queue.shift()
    const row = entitiesMap[cls]
    if (!row) continue
    for (const rel of row.relations) {
      if (!entitiesMap[rel] || seen.has(rel)) continue
      seen.add(rel)
      queue.push(rel)
    }
  }

  return seen
}

/**
 * Entity closure từ moduleIds — BFS quan hệ MikroORM sau seed theo module.
 * @param {string[]} moduleIds
 * @param {ReturnType<typeof buildEntityGraph>} graph
 * @param {{ includeAuthStack?: boolean }} [opts]
 */
function resolveEntityClosure(moduleIds, graph, opts = {}) {
  const seed = new Set()
  for (const moduleId of moduleIds) {
    for (const cls of graph.moduleEntities[moduleId] ?? []) {
      if (graph.entities[cls]) seed.add(cls)
    }
  }

  if (opts.includeAuthStack !== false && moduleIds.includes('auth')) {
    for (const cls of AUTH_STACK_CLASSES) seed.add(cls)
  }

  const closed = expandRelationClosure([...seed], graph.entities)
  const files = [...closed]
    .map((cls) => graph.entities[cls]?.fileName)
    .filter(Boolean)
    .sort()

  return {
    seed: [...seed].sort(),
    classes: [...closed].sort(),
    files,
    count: closed.size,
  }
}

module.exports = {
  AUTH_STACK_CLASSES,
  buildEntityGraph,
  resolveEntityClosure,
  expandRelationClosure,
  entityFileToClassName,
}
