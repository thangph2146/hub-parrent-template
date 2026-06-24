/**
 * Sửa import path bị corrupt trong module-bases/system (ponytail).
 * Usage: node packages/api-server/deploy/cli/fix-system-import-paths.cjs [dir...]
 */
const fs = require('node:fs')
const path = require('node:path')

const PKG_ROOT = path.join(__dirname, '../..')
const MONOREPO_ROOT = path.join(PKG_ROOT, '../..')
const DEFAULT_DIRS = [
  path.join(PKG_ROOT, 'deploy/nest/src/common/module-bases/system'),
  path.join(MONOREPO_ROOT, 'apps/hub-checkin/api/src/common/module-bases/system'),
]

const BROKEN_IMPORT_RE =
  /from\s+(['"])((?:\.\.\/)*\.?\/?packages\/api-server\/deploy\/nest\/src\/common\/module-bases\/system\/[^'"]+)\1/g

function listTsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) listTsFiles(full, out)
    else if (entry.name.endsWith('.ts')) out.push(full)
  }
  return out
}

function getSystemDir(filePath) {
  const norm = filePath.replace(/\\/g, '/')
  const marker = '/common/module-bases/system/'
  const idx = norm.indexOf(marker)
  if (idx === -1) return null
  return norm.slice(0, idx + marker.length - 1)
}

function fixImportPath(filePath, spec) {
  const marker = 'module-bases/system/'
  const pos = spec.indexOf(marker)
  if (pos === -1) return spec

  const suffix = spec.slice(pos + marker.length).replace(/^\.\//, '')
  const systemDir = getSystemDir(filePath)
  if (!systemDir) return spec

  const fileDir = path.dirname(filePath)
  const target = path.join(systemDir, ...suffix.split('/'))
  let rel = path.relative(fileDir, target).replace(/\\/g, '/')
  if (!rel.startsWith('.')) rel = `./${rel}`
  return rel
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  content = content.replace(BROKEN_IMPORT_RE, (_, quote, spec) => {
    const fixed = fixImportPath(filePath, spec)
    if (fixed !== spec) changed = true
    return `from ${quote}${fixed}${quote}`
  })

  if (filePath.replace(/\\/g, '/').includes('/system/import/')) {
    const next = content.replace(
      /from\s+(['"])\.\.\/\.\.\/index\1/g,
      "from '../../../entity-id'",
    )
    if (next !== content) {
      content = next
      changed = true
    }
  }

  if (changed) fs.writeFileSync(filePath, content)
  return changed
}

const dirs = process.argv.slice(2).map((d) => path.resolve(d))
const targets = dirs.length ? dirs : DEFAULT_DIRS

let fixed = 0
for (const dir of targets) {
  for (const file of listTsFiles(dir)) {
    if (fixFile(file)) {
      fixed++
      console.log(`fixed ${file}`)
    }
  }
}
console.log(`[fix-system-import-paths] ${fixed} file(s)`)
