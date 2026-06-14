/**
 * Đổi @workspace/api-server/common → import local ../common (apps/main/api).
 *
 *   pnpm main-api:migrate-common-imports
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('./lib/monorepo-root.cjs')
const { MAIN_API_PATH } = require('../config/product-lines.cjs')

const SRC = path.join(ROOT, MAIN_API_PATH, 'src')
const PKG_IMPORT = "@workspace/api-server/common"
const SKIP_DIRS = new Set(['module-bases', 'crud', 'module-types'])

function commonImportPath(fileAbs) {
  const rel = path.relative(SRC, path.dirname(fileAbs)).replace(/\\/g, '/')
  if (!rel || rel === '.') return './common'
  const depth = rel.split('/').length
  return `${ '../'.repeat(depth) }common`
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (dir === SRC && SKIP_DIRS.has(entry.name)) continue
      if (dir === path.join(SRC, 'common')) continue
      walk(abs, out)
      continue
    }
    if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      out.push(abs)
    }
  }
  return out
}

function migrateFile(fileAbs) {
  let content = fs.readFileSync(fileAbs, 'utf8')
  if (!content.includes(PKG_IMPORT)) return false
  const target = commonImportPath(fileAbs)
  const next = content.replaceAll(`from '${PKG_IMPORT}'`, `from '${target}'`)
  if (next === content) return false
  fs.writeFileSync(fileAbs, next, 'utf8')
  return true
}

function migrateMainApiCommonImports() {
  const files = walk(SRC)
  let count = 0
  for (const file of files) {
    if (migrateFile(file)) count++
  }
  console.log(`[main-api:migrate-common-imports] updated ${count} file`)
  return count
}

if (require.main === module) {
  migrateMainApiCommonImports()
}

module.exports = { migrateMainApiCommonImports }
