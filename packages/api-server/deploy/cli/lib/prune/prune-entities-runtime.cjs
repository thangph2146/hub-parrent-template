/**
 * Prune entity runtime theo graph closure — chỉ khi --prune-entities.
 * Migrations luôn full; mặc định render copy full entities.
 */
const fs = require('node:fs')
const path = require('node:path')
const { resolveEntityClosureForModules } = require('../graph/resolve-entity-closure.cjs')

const IMPORT_LINE_RE =
  /^import \{ (\w+) \} from '\.\.\/entities\/([^']+)';$/
const EXPORT_ARRAY_START = 'export const ormEntities = ['

function patchOrmEntities(appRoot, classNames) {
  const ormPath = path.join(appRoot, 'src/mikro-orm/orm-entities.ts')
  if (!fs.existsSync(ormPath)) return { patched: false }

  const keep = new Set(classNames)
  const lines = fs.readFileSync(ormPath, 'utf8').split('\n')
  const out = []
  let inArray = false

  for (const line of lines) {
    const imp = line.match(IMPORT_LINE_RE)
    if (imp) {
      if (keep.has(imp[1])) out.push(line)
      continue
    }
    if (line.startsWith(EXPORT_ARRAY_START)) {
      out.push(line)
      inArray = true
      continue
    }
    if (inArray) {
      const trimmed = line.trim()
      if (trimmed === '];') {
        out.push(line)
        inArray = false
        continue
      }
      const name = trimmed.replace(/,$/, '')
      if (keep.has(name)) out.push(line)
      continue
    }
    out.push(line)
  }

  fs.writeFileSync(ormPath, out.join('\n'), 'utf8')
  return { patched: true, count: keep.size }
}

function pruneEntityFiles(appRoot, keepFiles, { quiet = false } = {}) {
  const entitiesDir = path.join(appRoot, 'src/entities')
  if (!fs.existsSync(entitiesDir)) return []

  const keep = new Set(keepFiles)
  keep.add('base.entity.ts')
  const pruned = []

  for (const name of fs.readdirSync(entitiesDir)) {
    if (!name.endsWith('.entity.ts')) continue
    if (keep.has(name)) continue
    fs.unlinkSync(path.join(entitiesDir, name))
    pruned.push(name)
    if (!quiet) console.log(`[render:entity-graph] pruned entities/${name}`)
  }

  return pruned
}

/**
 * @param {string} appRoot
 * @param {string[]} moduleIds Sau module closure
 * @param {{ quiet?: boolean }} [opts]
 */
function pruneEntitiesRuntime(appRoot, moduleIds, opts = {}) {
  const result = resolveEntityClosureForModules(moduleIds, {
    expandModuleClosure: false,
  })
  const prunedFiles = pruneEntityFiles(appRoot, result.files, opts)
  const orm = patchOrmEntities(appRoot, result.classes)

  if (!opts.quiet) {
    console.log(
      `[render:entity-graph] ${result.count}/${result.totalEntities} entities (graph closure)`,
    )
  }

  return {
    ...result,
    prunedFiles,
    orm,
  }
}

/**
 * Log footprint entity khi partial render (không xóa file).
 */
function logEntityFootprint(moduleIds) {
  try {
    const result = resolveEntityClosureForModules(moduleIds, {
      expandModuleClosure: false,
    })
    console.log(
      `[render:entity-graph] partial footprint: ${result.count}/${result.totalEntities} entities nếu --prune-entities (mặc định: full copy)`,
    )
    return result
  } catch (err) {
    console.warn(`[render:entity-graph] ${err.message}`)
    return null
  }
}

module.exports = { pruneEntitiesRuntime, logEntityFootprint, patchOrmEntities }
