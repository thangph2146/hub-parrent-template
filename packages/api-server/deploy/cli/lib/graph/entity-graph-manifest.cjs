/**
 * Sinh / đọc entity-graph.manifest.json — nguồn sự thật cho render closure.
 */
const fs = require('node:fs')
const path = require('node:path')
const { buildEntityGraph } = require('./build-entity-graph.cjs')

const MANIFEST_REL = 'packages/api-server/deploy/config/entity-graph.manifest.json'
const MARKDOWN_REL = 'packages/api-server/deploy/config/API_ENTITY_GRAPH.md'
const MAIN_API_GRAPHIFY_MD =
  'apps/main/api/.graphify/markdown/API_ENTITY_GRAPH.md'

function manifestPath(root) {
  return path.join(root, MANIFEST_REL)
}

function loadEntityGraphManifest(root) {
  const abs = manifestPath(root)
  if (!fs.existsSync(abs)) {
    throw new Error(
      `[entity-graph] Thiếu ${MANIFEST_REL} — chạy pnpm api:sync-template`,
    )
  }
  return JSON.parse(fs.readFileSync(abs, 'utf8'))
}

function formatEntityGraphMarkdown(graph) {
  const lines = [
    '# API — entity graph (MikroORM closure)',
    '',
    `> **Sinh tự động:** \`${graph.generatedAt}\` từ \`${graph.source}\`.`,
    '> **Mục đích:** partial render / prune entity **bắt buộc** dùng closure từ manifest này — không cắt entity thủ công.',
    '',
    '## Chính sách render',
    '',
    '| Chế độ | Entities | Migrations |',
    '|--------|----------|------------|',
    '| **Mặc định (khuyến nghị)** | Copy **full** `src/entities/` | Copy full |',
    '| `--prune-entities` (thử nghiệm) | Closure từ graph module + quan hệ | Vẫn full (schema thống nhất) |',
    '',
    'Module closure (`resolve-module-closure`) và entity closure (`resolve-entity-closure`) là **hai lớp độc lập** — graphify/API_DOMAIN_IMPORTS cho module; manifest này cho entity.',
    '',
    `## Tổng quan (${graph.entityCount} entity)`,
    '',
    '| Entity | File | Quan hệ (class) |',
    '|--------|------|-----------------|',
  ]

  for (const [cls, row] of Object.entries(graph.entities).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const rels = row.relations.length ? row.relations.map((r) => `\`${r}\``).join(', ') : '—'
    lines.push(`| \`${cls}\` | \`${row.fileName}\` | ${rels} |`)
  }

  lines.push('')
  lines.push('## Module → entity (import trong domain)')
  lines.push('')
  lines.push('| Module | Entity classes |')
  lines.push('|--------|----------------|')

  for (const [mod, ents] of Object.entries(graph.moduleEntities).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const cell =
      ents.length > 0 ? ents.map((e) => `\`${e}\``).join(', ') : '—'
    lines.push(`| \`${mod}\` | ${cell} |`)
  }

  lines.push('')
  lines.push('## Làm mới')
  lines.push('')
  lines.push('```bash')
  lines.push('pnpm api:sync-template')
  lines.push('pnpm verify:entity-closure')
  lines.push('```')
  lines.push('')

  return lines.join('\n')
}

/**
 * @param {string} root Monorepo root
 * @param {{ quiet?: boolean, log?: { detail?: Function, step?: Function } }} [opts]
 */
function writeEntityGraphManifest(root, opts = {}) {
  const graph = buildEntityGraph()
  const manifestAbs = manifestPath(root)
  fs.mkdirSync(path.dirname(manifestAbs), { recursive: true })
  fs.writeFileSync(manifestAbs, `${JSON.stringify(graph, null, 2)}\n`, 'utf8')

  const md = formatEntityGraphMarkdown(graph)
  const mdAbs = path.join(root, MARKDOWN_REL)
  fs.writeFileSync(mdAbs, md, 'utf8')

  const graphifyMdAbs = path.join(root, MAIN_API_GRAPHIFY_MD)
  fs.mkdirSync(path.dirname(graphifyMdAbs), { recursive: true })
  fs.writeFileSync(graphifyMdAbs, md, 'utf8')

  if (!opts.quiet) {
    opts.log?.detail?.(
      'entity-graph',
      `${graph.entityCount} entities → ${MANIFEST_REL}`,
    )
  }

  return { graph, manifestAbs, markdownAbs: mdAbs }
}

module.exports = {
  MANIFEST_REL,
  MARKDOWN_REL,
  MAIN_API_GRAPHIFY_MD,
  manifestPath,
  loadEntityGraphManifest,
  writeEntityGraphManifest,
  formatEntityGraphMarkdown,
}
