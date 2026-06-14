/**
 * Materialize src/common root cho deploy/nest.
 * - pkg: packages/api-server/src/common
 * - infra: deploy/template-common/ (vend từ main, không mirror full main/common)
 */
const fs = require('node:fs')
const path = require('node:path')
const { writeCommonBarrel } = require('./sync-module-bases.cjs')
const { PACKAGE_ROOT } = require('../monorepo-root.cjs')
const { ROOT } = require('../monorepo-root.cjs')
const { MAIN_API_PATH } = require('../../../config/product-lines.cjs')
const {
  TEMPLATE_COMMON_DIR,
  TEMPLATE_INFRA_FILES,
} = require('../../../config/template-common.cjs')
const { createLogger } = require('../cli-logger.cjs')

const PKG_COMMON = path.join(PACKAGE_ROOT, 'src/common')
const MAIN_COMMON = path.join(ROOT, MAIN_API_PATH, 'src/common')
/** Subtree mirror từ main — binding deploy import ../common/admin|commerce|infra|app */
const MAIN_COMMON_DIRS = ['admin', 'commerce', 'infra', 'app']

const PKG_SKIP = new Set([
  'apply-column-filters.ts',
  'build-admin-list-params.ts',
  'index.ts',
])

function isSpecFile(name) {
  return /\.(spec|integration\.spec)\.ts$/.test(name)
}

function copyMainCommonDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return 0
  fs.mkdirSync(destDir, { recursive: true })
  let count = 0
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      count += copyMainCommonDir(srcPath, destPath)
      continue
    }
    if (!entry.name.endsWith('.ts') || isSpecFile(entry.name)) continue
    fs.copyFileSync(srcPath, destPath)
    count++
  }
  return count
}

function syncCommonRoot(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const dest = path.join(destRoot, 'src/common')
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true })
  }
  fs.mkdirSync(dest, { recursive: true })

  let fromPkg = 0
  for (const file of fs.readdirSync(PKG_COMMON)) {
    if (!file.endsWith('.ts')) continue
    if (PKG_SKIP.has(file) || isSpecFile(file)) continue
    fs.copyFileSync(path.join(PKG_COMMON, file), path.join(dest, file))
    fromPkg++
  }

  let fromInfra = 0
  for (const file of TEMPLATE_INFRA_FILES) {
    const src = path.join(TEMPLATE_COMMON_DIR, file)
    if (!fs.existsSync(src)) {
      throw new Error(
        `[sync:common] Thiếu deploy/template-common/${file} — copy từ apps/main/api/src/common`,
      )
    }
    fs.copyFileSync(src, path.join(dest, file))
    fromInfra++
  }

  writeCommonBarrel(destRoot)

  let fromMainDirs = 0
  for (const dir of MAIN_COMMON_DIRS) {
    fromMainDirs += copyMainCommonDir(path.join(MAIN_COMMON, dir), path.join(dest, dir))
  }

  log.step(
    'sync:common',
    `root ← pkg=${fromPkg} template-common=${fromInfra} main-dirs=${fromMainDirs} file`,
  )

  return fromPkg + fromInfra + fromMainDirs
}

module.exports = { syncCommonRoot, PKG_SKIP }
