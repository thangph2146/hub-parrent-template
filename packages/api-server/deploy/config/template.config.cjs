/**
 * Cấu hình template NestJS OOP — packages/api-server/deploy/nest.
 */
const fs = require('node:fs')
const path = require('node:path')
const { PACKAGE_ROOT } = require('../cli/lib/monorepo-root.cjs')
const { MAIN_API_PATH } = require('./product-lines.cjs')

const TEMPLATE_DIR = path.join('deploy', 'nest')

const TEMPLATE_BANNER =
  '/** AUTO-GENERATED — materialize từ @workspace/api-server/deploy/nest. Chạy: pnpm api:render */\n'

const SKIP_DIRS = new Set([
  'common',
  'config',
  'data-test',
  'entities',
  'migrations',
  'seeds',
  'seeders',
  'mikro-orm',
  'scripts',
  'testing',
])

/** Thư mục dưới template/src/ không copy từ main (thường rỗng / legacy). */
const SYNC_SKIP_SRC_DIRS = new Set(['testing'])

const SYNC_SKIP_NAMES = new Set([
  'node_modules',
  'dist',
  '.cache',
  '.turbo',
  'coverage',
  '.graphify',
  '.nyc_output',
])

const SYNC_SKIP_ROOT_FILES = new Set([
  'api.app.config.json',
  'tsc-errors.txt',
  'Dockerfile',
  '.env',
  '.env.local',
  '.env.example',
])

const SYNC_SKIP_FILE_PATTERNS = [
  /^full-export-.*\.json$/i,
  /^hub-system-export-.*\.json$/i,
  /^hub-system-export-.*\.json\.gz$/i,
  /^\.snapshot-.*\.json$/i,
  /\.(spec|integration\.spec)\.ts$/,
]

function resolveTemplateRoot() {
  return path.join(PACKAGE_ROOT, TEMPLATE_DIR)
}

function templateHasSource() {
  return fs.existsSync(path.join(resolveTemplateRoot(), 'src', 'main.ts'))
}

function listTemplateModuleIds(templateRoot = resolveTemplateRoot()) {
  const srcDir = path.join(templateRoot, 'src')
  if (!fs.existsSync(srcDir)) return []
  return fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b))
}

module.exports = {
  TEMPLATE_DIR,
  TEMPLATE_BANNER,
  SKIP_DIRS,
  SYNC_SKIP_SRC_DIRS,
  SYNC_SKIP_NAMES,
  SYNC_SKIP_ROOT_FILES,
  SYNC_SKIP_FILE_PATTERNS,
  MAIN_API_PATH,
  resolveTemplateRoot,
  templateHasSource,
  listTemplateModuleIds,
}
