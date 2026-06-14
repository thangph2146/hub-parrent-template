/**
 * Verify entity closure cho từng line deploy — graph là nguồn sự thật.
 *
 *   pnpm verify:entity-closure
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { ROOT } = require('../lib/monorepo-root.cjs')

const { resolveApiModules } = require('../../config/render.config.cjs')
const { resolveEntityClosureForModules } = require('../lib/graph/resolve-entity-closure.cjs')
const { MANIFEST_REL } = require('../lib/graph/entity-graph-manifest.cjs')

const DEPLOY_APPS = [
  'apps/hub-event/api',
  'apps/hub-parent/api',
  'apps/store-sync/api',
]

function fail(msg) {
  console.error(`[verify:entity-closure] FAIL: ${msg}`)
  process.exit(1)
}

function main() {
  const manifestPath = path.join(ROOT, MANIFEST_REL)
  if (!fs.existsSync(manifestPath)) {
    fail(`Thiếu ${MANIFEST_REL} — chạy pnpm api:sync-template`)
  }

  const graph = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  let ok = 0

  console.log(
    `[verify:entity-closure] manifest ${graph.entityCount} entities (${graph.generatedAt.slice(0, 10)})`,
  )

  for (const appRel of DEPLOY_APPS) {
    const configPath = path.join(ROOT, appRel, 'api.app.config.json')
    if (!fs.existsSync(configPath)) {
      console.log(`  skip ${appRel} (no api.app.config.json)`)
      continue
    }

    const { modules, renderAllModules } = resolveApiModules(appRel)
    const result = resolveEntityClosureForModules(modules)

    if (result.count > graph.entityCount) {
      fail(`${appRel}: closure ${result.count} > total ${graph.entityCount}`)
    }

    for (const cls of result.classes) {
      if (!graph.entities[cls]) {
        fail(`${appRel}: closure tham chiếu entity không có trong graph: ${cls}`)
      }
    }

    const pct = Math.round((result.count / graph.entityCount) * 100)
    const mode = renderAllModules ? 'full' : 'subset'
    console.log(
      `  OK ${appRel} (${mode}): ${result.modules.length} modules → ${result.count}/${graph.entityCount} entities (${pct}%)`,
    )
    ok++
  }

  if (ok === 0) {
    fail('Không có app deploy nào để verify')
  }

  console.log(`[verify:entity-closure] PASS (${ok} app)`)
}

main()
