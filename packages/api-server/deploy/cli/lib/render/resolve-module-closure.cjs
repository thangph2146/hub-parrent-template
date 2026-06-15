/**
 * Mở rộng danh sách module theo import ../peer trong template.
 * Bỏ qua shell (common, entities, …) — chỉ domain Nest runtime.
 */
const fs = require('node:fs')
const path = require('node:path')
const { SKIP_DIRS } = require('../../../config/template.config.cjs')

const IMPORT_PEER_RE = /from '\.\.\/([^/'"]+)/g

function resolveModuleClosure(moduleIds, templateRoot) {
  const srcDir = path.join(templateRoot, 'src')
  const queue = moduleIds.filter((id) => !SKIP_DIRS.has(id))
  const seen = new Set(queue)

  while (queue.length) {
    const id = queue.shift()
    if (SKIP_DIRS.has(id)) continue
    const dir = path.join(srcDir, id)
    if (!fs.existsSync(dir)) continue

    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.ts')) continue
      const content = fs.readFileSync(path.join(dir, name), 'utf8')
      let m
      IMPORT_PEER_RE.lastIndex = 0
      while ((m = IMPORT_PEER_RE.exec(content))) {
        const peer = m[1]
        if (SKIP_DIRS.has(peer) || seen.has(peer)) continue
        if (!fs.existsSync(path.join(srcDir, peer))) continue
        seen.add(peer)
        queue.push(peer)
      }
    }
  }

  return [...seen].sort((a, b) => a.localeCompare(b))
}

module.exports = { resolveModuleClosure }
