/**
 * Verify module graph — không còn thư mục src/{module} dư ngoài config+closure.
 *
 *   pnpm verify:module-graph
 *   node deploy/cli/verify/verify-module-graph.mjs apps/store-sync/api
 */
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { ROOT } = require('../lib/monorepo-root.cjs')
const { auditRenderModuleGraph } = require('../lib/render/resolve-render-module-set.cjs')

const DEPLOY_APPS = [
  'apps/hub-checkin/api',
  'apps/hub-parent/api',
  'apps/store-sync/api',
]

function fail(msg) {
  console.error(`[verify:module-graph] FAIL: ${msg}`)
  process.exit(1)
}

function main() {
  const single = process.argv[2]?.replace(/\\/g, '/')
  const apps = single ? [single] : DEPLOY_APPS
  let ok = 0

  console.log('[verify:module-graph] graph closure = nguồn sự thật module runtime (không shell)')

  for (const appRel of apps) {
    const audit = auditRenderModuleGraph(appRel)
    if (audit.orphans.length) {
      fail(
        `${appRel}: ${audit.orphans.length} module dư trên disk — ${audit.orphans.join(', ')}. Chạy: pnpm api:render ${appRel} --prune`,
      )
    }
    if (audit.missing.length) {
      fail(
        `${appRel}: thiếu ${audit.missing.length} module closure — ${audit.missing.join(', ')}. Chạy: pnpm api:render ${appRel} --prune`,
      )
    }
    console.log(
      `  OK ${appRel}: ${audit.expected.length} module (config+closure) khớp disk`,
    )
    ok++
  }

  if (ok === 0) fail('Không có app deploy nào để verify')
  console.log(`[verify:module-graph] PASS (${ok} app)`)
}

main()
