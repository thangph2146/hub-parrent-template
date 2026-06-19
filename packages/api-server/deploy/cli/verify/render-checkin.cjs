const { execSync } = require('node:child_process')
const path = require('node:path')
const { ROOT, PACKAGE_ROOT } = require('../lib/monorepo-root.cjs')

const args = process.argv.slice(2)
const verifyOnly = args.includes('--verify-only')
const regenerate = args.includes('--regenerate')
const forward = args.filter((a) => !['--verify-only', '--regenerate'].includes(a))

const runNode = (scriptRel, label) => {
  console.log(`\n[render:checkin] ${label}\n`)
  execSync(`node ${path.join(PACKAGE_ROOT, scriptRel)}`, { cwd: ROOT, stdio: 'inherit' })
}

if (verifyOnly || (!regenerate && !args.some((a) => a.startsWith('--')))) {
  runNode('deploy/cli/verify/checkin-api.mjs', 'verify materialize')
  if (!args.includes('--skip-parity')) {
    runNode('deploy/cli/verify/endpoint-parity.mjs', 'verify parity')
  }
  console.log('\n[render:checkin] Hoàn tất (verify).\n')
  process.exit(0)
}

const renderArgs = [
  `node ${path.join(PACKAGE_ROOT, 'deploy/cli/render.cjs')} apps/hub-checkin/api --prune`,
  ...forward,
  regenerate ? '' : '--skip-verify',
]
  .filter(Boolean)
  .join(' ')

console.log('\n[render:checkin] materialize\n')
execSync(renderArgs, { cwd: ROOT, stdio: 'inherit' })
console.log('\n[render:checkin] Hoàn tất.\n')
