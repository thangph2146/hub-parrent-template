/**
 * Verify API deploy materialize từ template (check-in / parent / store).
 *
 * Usage: node deploy/cli/verify/verify-render-api.mjs [apps/hub-checkin/api]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { ROOT } = require('../lib/monorepo-root.cjs')
const { resolveApiModules } = require('../../config/render.config.cjs')
const {
  auditRenderModuleGraph,
  resolveRenderModuleSet,
} = require('../lib/render/resolve-render-module-set.cjs')
const { resolveEntityClosureForModules } = require('../lib/graph/resolve-entity-closure.cjs')

const APP_REL = (process.argv[2] ?? 'apps/hub-checkin/api').replace(/\\/g, '/')
const appRoot = path.join(ROOT, APP_REL)

if (!fs.existsSync(path.join(appRoot, 'api.app.config.json'))) {
  console.error(`[verify:render-api] Thiếu ${APP_REL}/api.app.config.json`)
  process.exit(1)
}

const { modules, renderAllModules, config } = resolveApiModules(APP_REL)
const expected = resolveRenderModuleSet(APP_REL)
const errors = []

for (const rel of ['package.json', 'nest-cli.json', 'src/main.ts', 'src/app.module.ts']) {
  if (!fs.existsSync(path.join(appRoot, rel))) errors.push(`Thiếu ${rel}`)
}

const appModuleSrc = fs.existsSync(path.join(appRoot, 'src/app.module.ts'))
  ? fs.readFileSync(path.join(appRoot, 'src/app.module.ts'), 'utf8')
  : ''
if (appModuleSrc && !/\bDatabaseModule\b/.test(appModuleSrc)) {
  errors.push(
    'app.module.ts thiếu DatabaseModule — chạy lại pnpm api:render với pipeline mới',
  )
}

for (const moduleId of expected) {
  const moduleDir = path.join(appRoot, 'src', moduleId)
  if (!fs.existsSync(moduleDir)) {
    errors.push(`Thiếu src/${moduleId}/ (closure graph)`)
    continue
  }
  if (!fs.readdirSync(moduleDir).some((n) => n.endsWith('.module.ts'))) {
    errors.push(`src/${moduleId}/ không có *.module.ts`)
  }
}

const { orphans, missing } = auditRenderModuleGraph(APP_REL)
if (orphans.length) {
  errors.push(
    `Module dư (không thuộc graph closure): ${orphans.join(', ')} — chạy pnpm api:render ${APP_REL} --prune`,
  )
}
if (missing.length) {
  errors.push(`Module thiếu so với closure: ${missing.join(', ')}`)
}

if (!renderAllModules) {
  const entityClosure = resolveEntityClosureForModules(expected, {
    expandModuleClosure: false,
  })
  const excludeEntities = new Set(config?.excludeEntities ?? [])
  const expectedClosureFiles = entityClosure.files.filter((name) => {
    const className = Object.entries(entityClosure.graph.entities).find(
      ([, entity]) => entity.fileName === name,
    )?.[0]
    return !className || !excludeEntities.has(className)
  })
  const expectedEntityFiles = new Set(['base.entity.ts', ...expectedClosureFiles])
  const entitiesDir = path.join(appRoot, 'src/entities')
  const actualEntityFiles = fs.existsSync(entitiesDir)
    ? fs.readdirSync(entitiesDir).filter((name) => name.endsWith('.entity.ts')).sort()
    : []
  const extraEntities = actualEntityFiles.filter((name) => !expectedEntityFiles.has(name))
  const missingEntities = [...expectedEntityFiles].filter((name) => !actualEntityFiles.includes(name))

  if (extraEntities.length) {
    errors.push(`Entity dư ngoài graph closure: ${extraEntities.join(', ')}`)
  }
  if (missingEntities.length) {
    errors.push(`Entity thiếu so với graph closure: ${missingEntities.join(', ')}`)
  }

  const ormPath = path.join(appRoot, 'src/mikro-orm/orm-entities.ts')
  const ormSrc = fs.existsSync(ormPath) ? fs.readFileSync(ormPath, 'utf8') : ''
  const ormEntityFiles = [
    ...ormSrc.matchAll(/from ['"]\.\.\/entities\/([^'"]+)['"]/g),
  ].map((match) => `${match[1]}.ts`)
  const extraOrmEntities = ormEntityFiles.filter((name) => !expectedEntityFiles.has(name))
  const missingOrmEntities = expectedClosureFiles.filter((name) => !ormEntityFiles.includes(name))

  if (extraOrmEntities.length) {
    errors.push(`orm-entities.ts còn entity dư: ${extraOrmEntities.join(', ')}`)
  }
  if (missingOrmEntities.length) {
    errors.push(`orm-entities.ts thiếu entity closure: ${missingOrmEntities.join(', ')}`)
  }
}

if (errors.length) {
  console.error(`[verify:render-api] FAIL ${APP_REL}:\n` + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

const label = APP_REL.split('/').slice(1, 2).join('-') || 'api'
console.log(
  `[verify:render-api] OK — ${APP_REL} · ${expected.length} module graph (${label})`,
)
