/**
 * Mirror 100% apps/main/api → deploy/nest trước copy:
 * - Xóa thư mục src/* không còn ở main (orphan)
 * - Wipe thư mục src/* có ở main để copyRecursive ghi đè sạch (không sót file cũ)
 *
 * Không đụng src/common — syncCommonRoot rebuild riêng.
 */
const fs = require('node:fs')
const path = require('node:path')
const { ROOT } = require('../monorepo-root.cjs')
const { createLogger } = require('../cli-logger.cjs')
const {
  MAIN_API_PATH,
  SYNC_SKIP_SRC_DIRS,
  SYNC_SKIP_FILE_PATTERNS,
} = require('../../../config/template.config.cjs')

const SKIP_WIPE_DIRS = new Set(['common', ...SYNC_SKIP_SRC_DIRS])

function shouldSkipMirrorFile(name) {
  return SYNC_SKIP_FILE_PATTERNS.some((re) => re.test(name))
}

/** @returns {{ dirs: Set<string>, rootFiles: Set<string> }} */
function listMainSrcMirror(mainSrc) {
  const dirs = new Set()
  const rootFiles = new Set()
  if (!fs.existsSync(mainSrc)) return { dirs, rootFiles }

  for (const entry of fs.readdirSync(mainSrc, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_WIPE_DIRS.has(entry.name)) continue
      dirs.add(entry.name)
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.ts') && !shouldSkipMirrorFile(entry.name)) {
      rootFiles.add(entry.name)
    }
  }

  return { dirs, rootFiles }
}

/**
 * @param {string} destRoot deploy/nest root
 * @param {{ quiet?: boolean, verbose?: boolean, log?: ReturnType<import('../cli-logger.cjs').createLogger> }} [options]
 */
function pruneStaleTemplateMirror(destRoot, options = {}) {
  const log = options.log ?? createLogger(options)
  const mainSrc = path.join(ROOT, MAIN_API_PATH, 'src')
  const nestSrc = path.join(destRoot, 'src')
  const { dirs: mainDirs, rootFiles: mainRootFiles } = listMainSrcMirror(mainSrc)

  if (!fs.existsSync(nestSrc)) {
    fs.mkdirSync(nestSrc, { recursive: true })
    return { wipedDirs: 0, removedOrphans: 0, removedRootFiles: 0 }
  }

  let wipedDirs = 0
  let removedOrphans = 0
  let removedRootFiles = 0
  /** @type {string[]} */
  const wipedNames = []
  /** @type {string[]} */
  const orphanNames = []

  for (const entry of fs.readdirSync(nestSrc, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const name = entry.name
      if (SKIP_WIPE_DIRS.has(name)) continue

      const abs = path.join(nestSrc, name)
      if (mainDirs.has(name)) {
        fs.rmSync(abs, { recursive: true, force: true })
        wipedDirs++
        wipedNames.push(name)
        log.detail('prune:stale-mirror', `wiped src/${name}/ (refresh from main)`)
      } else {
        fs.rmSync(abs, { recursive: true, force: true })
        removedOrphans++
        orphanNames.push(name)
        log.detail('prune:stale-mirror', `removed orphan src/${name}/`)
      }
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.ts')) continue
    if (shouldSkipMirrorFile(entry.name)) continue
    if (mainRootFiles.has(entry.name)) continue

    fs.unlinkSync(path.join(nestSrc, entry.name))
    removedRootFiles++
    log.detail('prune:stale-mirror', `removed orphan src/${entry.name}`)
  }

  const parts = []
  if (wipedDirs > 0) {
    const sample = wipedNames.slice(0, 4).join(', ')
    const suffix = wipedNames.length > 4 ? ` · +${wipedNames.length - 4} dir` : ''
    parts.push(`refresh ${wipedDirs} dir (${sample}${suffix})`)
  }
  if (removedOrphans > 0) {
    parts.push(`orphan ${removedOrphans} dir (${orphanNames.join(', ')})`)
  }
  if (removedRootFiles > 0) {
    parts.push(`${removedRootFiles} orphan root file`)
  }

  if (parts.length > 0 && !log.verbose) {
    log.step('prune:stale-mirror', parts.join(' · '))
  }

  return { wipedDirs, removedOrphans, removedRootFiles, wipedNames, orphanNames }
}

module.exports = { pruneStaleTemplateMirror, listMainSrcMirror, SKIP_WIPE_DIRS }
