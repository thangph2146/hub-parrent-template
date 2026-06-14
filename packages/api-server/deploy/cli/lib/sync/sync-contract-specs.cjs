/**
 * Vend contract tests từ packages/api-server/src → deploy/nest (sau cleanTemplateSpecs).
 * Giữ parity test CRUD/common/data-test giữa pkg và template render.
 */
const fs = require('node:fs')
const path = require('node:path')
const { PACKAGE_ROOT } = require('../monorepo-root.cjs')
const { createLogger } = require('../cli-logger.cjs')

const PKG_SRC = path.join(PACKAGE_ROOT, 'src')

/** @type {Array<{ from: string; to: string; rewrite?: (content: string) => string }>} */
const CONTRACT_SPECS = [
  { from: 'common/entity-id.spec.ts', to: 'common/entity-id.spec.ts' },
  { from: 'common/parse-list-query.spec.ts', to: 'common/parse-list-query.spec.ts' },
  { from: 'common/pagination.spec.ts', to: 'common/pagination.spec.ts' },
  { from: 'common/bulk-actions.spec.ts', to: 'common/bulk-actions.spec.ts' },
  { from: 'common/api-response.spec.ts', to: 'common/api-response.spec.ts' },
  {
    from: 'common/apply-column-filters.spec.ts',
    to: 'common/crud/crud-apply-column-filters.spec.ts',
    rewrite: (content) =>
      content
        .replace(
          "from './apply-column-filters'",
          "from './crud-apply-column-filters'",
        )
        .replace(/from '\.\.\/data-test\//g, "from '../../data-test/"),
  },
  {
    from: 'bases/base-crud.controller.spec.ts',
    to: 'common/crud/base-crud.controller.spec.ts',
    rewrite: (content) =>
      content
        .replace(/from '\.\.\/types'/g, "from './crud.types'")
        .replace(/from '\.\.\/types\/crud\.types'/g, "from './crud.types'")
        .replace(/from '\.\.\/data-test\//g, "from '../../data-test/"),
  },
  {
    from: 'bases/base-crud.service.spec.ts',
    to: 'common/crud/base-crud.service.spec.ts',
    rewrite: (content) =>
      content
        .replace(/from '\.\.\/types'/g, "from './crud.types'")
        .replace(/from '\.\.\/types\/crud\.types'/g, "from './crud.types'"),
  },
  {
    from: 'types/common.types.spec.ts',
    to: 'common/crud/common.types.spec.ts',
    rewrite: (content) => content.replace("from './common.types'", "from './common.types'"),
  },
  { from: 'data-test/fixture.ts', to: 'data-test/fixture.ts' },
  { from: 'data-test/fake-em.ts', to: 'data-test/fake-em.ts' },
  { from: 'data-test/fixture.spec.ts', to: 'data-test/fixture.spec.ts' },
  { from: 'data-test/fake-em.spec.ts', to: 'data-test/fake-em.spec.ts' },
]

const FIXTURE_GLOB = /^hub-system-export-.*\.json\.gz$/i

function copyFixtureGzip(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const srcFixtures = path.join(PKG_SRC, 'data-test', 'fixtures')
  const destFixtures = path.join(destRoot, 'src', 'data-test', 'fixtures')
  if (!fs.existsSync(srcFixtures)) return 0

  fs.mkdirSync(destFixtures, { recursive: true })
  let copied = 0
  for (const name of fs.readdirSync(srcFixtures)) {
    if (!FIXTURE_GLOB.test(name)) continue
    fs.copyFileSync(path.join(srcFixtures, name), path.join(destFixtures, name))
    copied++
    log.detail('sync:contract-specs', `fixture → src/data-test/fixtures/${name}`)
  }
  return copied
}

function syncContractSpecs(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  let copied = 0

  for (const entry of CONTRACT_SPECS) {
    const srcPath = path.join(PKG_SRC, entry.from)
    const destPath = path.join(destRoot, 'src', entry.to)
    if (!fs.existsSync(srcPath)) {
      log.warn('sync:contract-specs', `skip missing ${entry.from}`)
      continue
    }

    let content = fs.readFileSync(srcPath, 'utf8')
    if (entry.rewrite) content = entry.rewrite(content)
    content = content.replace(/\r\n/g, '\n')

    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.writeFileSync(destPath, content, 'utf8')
    copied++
    log.detail('sync:contract-specs', `${entry.from} → src/${entry.to}`)
  }

  const fixtures = copyFixtureGzip(destRoot, { log, ...options })
  log.step('sync:contract-specs', `${copied} spec/helper · ${fixtures} fixture(s)`)

  return { specs: copied, fixtures }
}

module.exports = { syncContractSpecs, CONTRACT_SPECS }
