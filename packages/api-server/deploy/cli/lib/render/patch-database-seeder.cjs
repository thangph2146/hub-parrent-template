/**
 * Partial render: DatabaseSeeder chỉ gọi seed runner khi module tương ứng có trong closure.
 */
const fs = require('node:fs')
const path = require('node:path')
const { TEMPLATE_BANNER } = require('../../../config/template.config.cjs')
const { writeFileWithRetry } = require('../fs-write-retry.cjs')

const SEED_RUNNERS = [
  {
    moduleIds: ['events', 'event-registrations'],
    importPath: '../seeds/checkin-demo.runner',
    fn: 'runCheckinDemoSeed',
    includesBootstrap: true,
  },
  { moduleId: 'products', importPath: '../seeds/products-sample.runner', fn: 'seedSampleProducts' },
  { moduleId: 'promo-codes', importPath: '../seeds/promo-codes-sample.runner', fn: 'seedSamplePromoCodes' },
  { moduleId: 'orders', importPath: '../seeds/orders-sample.runner', fn: 'seedSampleOrders' },
]

function patchDatabaseSeeder(appRoot, moduleIds, options = {}) {
  const seederPath = path.join(appRoot, 'src/seeders/DatabaseSeeder.ts')
  if (!fs.existsSync(seederPath)) return false

  const keep = new Set(moduleIds)
  const active = SEED_RUNNERS.filter((row) =>
    row.moduleIds
      ? row.moduleIds.every((moduleId) => keep.has(moduleId))
      : keep.has(row.moduleId),
  )

  const includesBootstrap = active.some((row) => row.includesBootstrap)

  const imports = [
    "import { Seeder } from '@mikro-orm/seeder';",
    "import type { EntityManager } from '@mikro-orm/core';",
    ...(!includesBootstrap
      ? ["import { runSuperadminBootstrap } from '../seeds/superadmin-bootstrap.runner';"]
      : []),
    ...active.map(
      (row) => `import { ${row.fn} } from '${row.importPath}';`,
    ),
  ]

  const calls = [
    ...(!includesBootstrap ? ['await runSuperadminBootstrap(em);'] : []),
    ...active.map((row) => `await ${row.fn}(em);`),
  ]

  const content = `${TEMPLATE_BANNER}
${imports.join('\n')}

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    ${calls.join('\n    ')}
  }
}
`

  writeFileWithRetry(seederPath, content)
  if (!options.quiet) {
    console.log(
      `[render:database-seeder] ${active.length ? active.map((r) => r.moduleId ?? r.moduleIds.join('+')).join(', ') : 'chỉ superadmin'}`,
    )
  }
  return true
}

module.exports = { patchDatabaseSeeder, SEED_RUNNERS }
