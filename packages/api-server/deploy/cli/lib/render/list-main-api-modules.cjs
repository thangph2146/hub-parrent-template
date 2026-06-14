const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { MAIN_API_PATH } = require('../../../config/product-lines.cjs')
const { SKIP_DIRS } = require('../../../config/template.config.cjs')

function listMainApiModuleIds() {
  const srcDir = path.join(ROOT, MAIN_API_PATH, 'src')
  if (!fs.existsSync(srcDir)) return []
  return fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b))
}

module.exports = { listMainApiModuleIds }
