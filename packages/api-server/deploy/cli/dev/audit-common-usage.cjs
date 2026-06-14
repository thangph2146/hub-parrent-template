/** Audit import usage of deploy/nest/src/common root *.ts (incl. internal common imports). */
const fs = require('node:fs')
const path = require('node:path')
const { resolveTemplateRoot } = require('../../config/template.config.cjs')

const root = path.join(resolveTemplateRoot(), 'src')
const commonDir = path.join(root, 'common')
const indexContent = fs.existsSync(path.join(commonDir, 'index.ts'))
  ? fs.readFileSync(path.join(commonDir, 'index.ts'), 'utf8')
  : ''

const sources = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs)
    else if (entry.name.endsWith('.ts')) {
      sources.push({ abs, content: fs.readFileSync(abs, 'utf8') })
    }
  }
}
walk(root)

function isImported(base, fromFile) {
  const patterns = [
    `'./${base}'`,
    `"./${base}"`,
    `'../${base}'`,
    `"../${base}"`,
    `/common/${base}'`,
    `/common/${base}"`,
    `'../../${base}'`,
    `"../../${base}"`,
  ]
  return sources.some(
    ({ abs, content }) =>
      abs !== fromFile && patterns.some((p) => content.includes(p)),
  )
}

function exportedFromIndex(base) {
  return (
    indexContent.includes(`'./${base}'`) ||
    indexContent.includes(`"./${base}"`)
  )
}

const files = fs
  .readdirSync(commonDir)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .sort()

let dead = 0
for (const file of files) {
  if (file.endsWith('.spec.ts')) {
    console.log(`SPEC ${file}`)
    continue
  }
  const base = file.replace(/\.ts$/, '')
  const fromFile = path.join(commonDir, file)
  const used =
    isImported(base, fromFile) ||
    (exportedFromIndex(base) &&
      sources.some(
        ({ content }) =>
          content.includes("from '../../index'") ||
          content.includes('from "../common"') ||
          content.includes("from '../common'") ||
          content.includes("from '../../common/index'"),
      ))
  if (!used) dead++
  console.log(`${used ? 'USED' : 'DEAD'} ${file}`)
}
console.log(`\n${dead} dead production file(s) in common root`)
