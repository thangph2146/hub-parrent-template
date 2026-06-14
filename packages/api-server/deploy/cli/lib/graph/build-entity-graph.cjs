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
  /@(?:ManyToOne|OneToMany|OneToOne|ManyToMany)\(\(\)\s*=>\s*(\w+)/g
const EXPORT_CLASS_RE = /export\s+class\s+(\w+)/

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

function parseEntityFile(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf8')
  const classMatch = content.match(EXPORT_CLASS_RE)
  const className = classMatch?.[1] ?? entityFileToClassName(fileName)
  const relations = new Set()

  let m
  RELATION_RE.lastIndex = 0
  while ((m = RELATION_RE.exec(content))) {
    relations.add(m[1])
  }

  return { className, fileName, relations: [...relations] }
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

  /** @type {Record<string, { fileName: string, relations: string[] }>} */
  const entities = {}

  for (const fileName of entityFiles) {
    const parsed = parseEntityFile(path.join(entitiesDir, fileName), fileName)
    entities[parsed.className] = {
      fileName: parsed.fileName,
      relations: parsed.relations.sort(),
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
  }

  const relationEdgesFiltered = []
  for (const [cls, row] of Object.entries(entities)) {
    for (const rel of row.relations) {
      relationEdgesFiltered.push([cls, rel])
    }
  }

  return {
    source: apiRootRel,
    generatedAt: new Date().toISOString(),
    entityCount: entityFiles.length,
    entities,
    relationEdges: relationEdgesFiltered,
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
