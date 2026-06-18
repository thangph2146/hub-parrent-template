/**
 * Partial render: DatabaseSeeder chỉ gọi seed runner khi module tương ứng có trong closure.
 */
const fs = require('node:fs')
const path = require('node:path')
const { TEMPLATE_BANNER } = require('../../../config/template.config.cjs')
const { writeFileWithRetry } = require('../fs-write-retry.cjs')

const SEED_RUNNERS = [
  { moduleId: 'products', importPath: '../seeds/products-sample.runner', fn: 'seedSampleProducts' },
  { moduleId: 'promo-codes', importPath: '../seeds/promo-codes-sample.runner', fn: 'seedSamplePromoCodes' },
  { moduleId: 'orders', importPath: '../seeds/orders-sample.runner', fn: 'seedSampleOrders' },
]

function patchDatabaseSeeder(appRoot, moduleIds, options = {}) {
  const seederPath = path.join(appRoot, 'src/seeders/DatabaseSeeder.ts')
  if (!fs.existsSync(seederPath)) return false

  const keep = new Set(moduleIds)
  const active = SEED_RUNNERS.filter((row) => keep.has(row.moduleId))

  const imports = [
    "import { Seeder } from '@mikro-orm/seeder';",
    "import type { EntityManager } from '@mikro-orm/core';",
    "import { runSuperadminBootstrap } from '../seeds/superadmin-bootstrap.runner';",
    ...active.map(
      (row) => `import { ${row.fn} } from '${row.importPath}';`,
    ),
  ]

  const calls = [
    'await runSuperadminBootstrap(em);',
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
      `[render:database-seeder] ${active.length ? active.map((r) => r.moduleId).join(', ') : 'chỉ superadmin'}`,
    )
  }
  return true
}

module.exports = { patchDatabaseSeeder, SEED_RUNNERS }
