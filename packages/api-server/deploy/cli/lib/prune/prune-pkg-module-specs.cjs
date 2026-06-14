/**
 * Xóa *.spec.ts trong src/modules — test CRUD thuộc apps/main/api, pkg chỉ giữ Base* source.
 * Chạy: node deploy/cli/lib/prune/prune-pkg-module-specs.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const { PACKAGE_ROOT } = require('../monorepo-root.cjs')

const MODULES = path.join(PACKAGE_ROOT, 'src', 'modules')

function pruneModuleSpecs({ quiet = false } = {}) {
  if (!fs.existsSync(MODULES)) return 0
  let removed = 0
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (/\.(spec|integration\.spec)\.ts$/.test(entry.name)) {
        fs.unlinkSync(p)
        removed++
        if (!quiet) {
          console.log(`[prune:pkg-specs] removed ${path.relative(PACKAGE_ROOT, p)}`)
        }
      }
    }
  }
  walk(MODULES)
  return removed
}

if (require.main === module) {
  const n = pruneModuleSpecs({ quiet: false })
  console.log(`[prune:pkg-specs] xong — ${n} file`)
}

module.exports = { pruneModuleSpecs }
