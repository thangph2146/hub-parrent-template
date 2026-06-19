/**
 * Ma trận render — check-in · parent · store (tự điều chỉnh, restore check-in cuối).
 *
 *   pnpm api:render:matrix
 *   pnpm api:render:matrix -- --lines=checkin,parent,store
 */
const { execSync } = require('node:child_process')
const path = require('node:path')
const { ROOT, PACKAGE_ROOT } = require('./lib/monorepo-root.cjs')

const args = process.argv.slice(2).filter((a) => a !== '--')
const verbose = args.includes('--verbose')
const linesArg = args.find((a) => a.startsWith('--lines='))?.slice('--lines='.length)
const selectedLines = linesArg
  ? linesArg.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)
  : ['checkin', 'parent', 'store']

const RENDER_CLI = path.join(PACKAGE_ROOT, 'deploy/cli/render.cjs')
const SYNC_CLI = path.join(PACKAGE_ROOT, 'deploy/cli/sync-template.cjs')
const VERIFY_TEMPLATE = path.join(PACKAGE_ROOT, 'deploy/cli/verify/template.mjs')
const VERIFY_RENDER = path.join(PACKAGE_ROOT, 'deploy/cli/verify/verify-render-api.mjs')

const LINES = {
  checkin: {
    app: 'apps/hub-checkin/api',
    scenarios: [
      {
        id: 'checkin-full',
        label: 'check-in full 48 module + prune',
        cmd: `node "${RENDER_CLI}" apps/hub-checkin/api --prune --skip-env --skip-sync-template`,
        verifyAfter: true,
      },
      {
        id: 'checkin-partial',
        label: 'check-in partial events+orders',
        cmd: `node "${RENDER_CLI}" apps/hub-checkin/api --modules=events,orders --prune --skip-env --skip-sync-template`,
      },
    ],
    restoreAfterLine: `node "${RENDER_CLI}" apps/hub-checkin/api --prune --skip-env --skip-sync-template`,
  },
  parent: {
    app: 'apps/hub-parent/api',
    scenarios: [
      {
        id: 'parent-full',
        label: 'parent full template (--all-modules)',
        cmd: `node "${RENDER_CLI}" apps/hub-parent/api --prune --skip-env --skip-sync-template --skip-parity`,
        verifyAfter: true,
      },
    ],
  },
  store: {
    app: 'apps/store-sync/api',
    scenarios: [
      {
        id: 'store-commerce',
        label: 'store subset commerce + prune',
        cmd: `node "${RENDER_CLI}" apps/store-sync/api --prune --skip-env --skip-sync-template --skip-parity`,
        verifyAfter: true,
      },
      {
        id: 'store-partial',
        label: 'store partial products+orders',
        cmd: `node "${RENDER_CLI}" apps/store-sync/api --modules=products,orders --prune --skip-env --skip-sync-template --skip-parity`,
      },
    ],
    restoreAfterLine: `node "${RENDER_CLI}" apps/store-sync/api --prune --skip-env --skip-sync-template --skip-parity`,
  },
}

function run(label, cmd) {
  console.log(`\n[render:matrix] ${label}\n`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', shell: true })
}

function main() {
  console.log('[render:matrix] ── check-in · parent · store ──')
  console.log(`  Lines: ${selectedLines.join(', ')}\n`)

  run('sync main → deploy/nest', `node "${SYNC_CLI}"${verbose ? ' --verbose' : ''}`)
  run('verify template', `node "${VERIFY_TEMPLATE}"`)

  const results = []

  for (const lineKey of selectedLines) {
    const line = LINES[lineKey]
    if (!line) {
      console.error(`[render:matrix] Unknown line: ${lineKey}`)
      process.exit(1)
    }

    for (const scenario of line.scenarios) {
      const started = Date.now()
      try {
        run(`${lineKey}: ${scenario.label}`, scenario.cmd)
        results.push({ line: lineKey, ...scenario, ok: true, ms: Date.now() - started })
        if (scenario.verifyAfter) {
          run(`verify ${line.app}`, `node "${VERIFY_RENDER}" ${line.app}`)
        }
      } catch (err) {
        results.push({
          line: lineKey,
          ...scenario,
          ok: false,
          ms: Date.now() - started,
          error: err.message ?? String(err),
        })
        console.error(`\n[render:matrix] FAIL — ${lineKey}/${scenario.id}`)
        printResults(results)
        process.exit(1)
      }
    }

    if (line.restoreAfterLine) {
      run(`${lineKey}: restore full`, line.restoreAfterLine)
      run(`verify ${line.app} (restore)`, `node "${VERIFY_RENDER}" ${line.app}`)
    }
  }

  printResults(results)
  console.log('\n[render:matrix] Hoàn tất — check-in · parent · store pass.\n')
}

function printResults(results) {
  console.log('\n[render:matrix] ── Kết quả ──')
  for (const r of results) {
    const mark = r.ok ? '✓' : '✗'
    console.log(`  ${mark} ${r.line}/${r.id}`.padEnd(36) + `${(r.ms / 1000).toFixed(1)}s`)
  }
}

main()
