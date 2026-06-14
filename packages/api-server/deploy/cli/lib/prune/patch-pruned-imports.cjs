/**
 * Sau prune thin-runtime: import trỏ src/{module}/helper.ts đã xóa → module-bases.
 */
const fs = require('node:fs')
const path = require('node:path')
const { createLogger } = require('../cli-logger.cjs')

const IMPORT_FROM_RE = /from '(\.\.?\/[^']+)';/g

function walkTsFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walkTsFiles(abs, out)
    else if (entry.name.endsWith('.ts')) out.push(abs)
  }
  return out
}

function resolveImportTarget(fromFile, spec) {
  const fromDir = path.dirname(fromFile)
  const abs = path.normalize(path.join(fromDir, spec))
  if (fs.existsSync(`${abs}.ts`)) return abs
  if (fs.existsSync(path.join(abs, 'index.ts'))) return path.join(abs, 'index.ts')
  return null
}

function moduleBasesCandidate(appRoot, fromFile, spec) {
  const srcRoot = path.join(appRoot, 'src')
  const fromDir = path.dirname(fromFile)
  const abs = path.normalize(path.join(fromDir, spec))
  const relFromSrc = path.relative(srcRoot, abs).replace(/\\/g, '/')

  const direct = relFromSrc.match(/^([^/]+)\/(.+)$/)
  if (direct) {
    const candidate = path.join(srcRoot, 'common/module-bases', direct[1], `${direct[2]}.ts`)
    if (fs.existsSync(candidate)) return candidate
  }

  const upModule = relFromSrc.match(/^\.\.\/([^/]+)\/(.+)$/)
  if (upModule) {
    const candidate = path.join(srcRoot, 'common/module-bases', upModule[1], `${upModule[2]}.ts`)
    if (fs.existsSync(candidate)) return candidate
  }

  return null
}

function toImportSpec(fromFile, targetAbs) {
  let rel = path.relative(path.dirname(fromFile), targetAbs).replace(/\\/g, '/')
  rel = rel.replace(/\.ts$/, '')
  if (!rel.startsWith('.')) rel = `./${rel}`
  return rel
}

function patchFileImports(appRoot, filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  content = content.replace(IMPORT_FROM_RE, (full, spec) => {
    if (resolveImportTarget(filePath, spec)) return full

    const candidate = moduleBasesCandidate(appRoot, filePath, spec)
    if (!candidate) return full

    changed = true
    return `from '${toImportSpec(filePath, candidate)}';`
  })

  if (changed) fs.writeFileSync(filePath, content, 'utf8')
  return changed
}

function patchPrunedModuleImports(appRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const srcDir = path.join(appRoot, 'src')
  let patched = 0

  for (const filePath of walkTsFiles(srcDir)) {
    if (patchFileImports(appRoot, filePath)) {
      patched++
      const rel = path.relative(appRoot, filePath).replace(/\\/g, '/')
      log.detail('prune:import-patch', rel)
    }
  }

  if (patched > 0 && !log.verbose) {
    log.step('prune:import-patch', `rewrote imports in ${patched} file`)
  }

  return patched
}

module.exports = { patchPrunedModuleImports, patchFileImports }
