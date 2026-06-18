/**
 * Sinh / đọc entity-graph.manifest.json — nguồn sự thật cho render closure.
 */
const fs = require('node:fs')
const path = require('node:path')
const { buildEntityGraph } = require('./build-entity-graph.cjs')
const { writeFileWithRetry } = require('../fs-write-retry.cjs')

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
    '## Module runtime (dọn dư)',
    '',
    '| Kiểm tra | Lệnh |',
    '|----------|------|',
    '| Module closure (import peer) | `resolve-module-closure` + `API_DOMAIN_IMPORTS.md` |',
    '| Không còn `src/{module}/` dư | `pnpm verify:module-graph` |',
    '| Dọn sau render subset | `pnpm api:render <app> --prune` (mặc định bật cho line không `renderAllModules`) |',
    '',
    'Module **không** nằm trong config+closure graph → phải xóa (`--prune`), không giữ thủ công.',
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
  lines.push(`## Join entities (${graph.joinEntities?.length ?? 0})`)
  lines.push('')
  lines.push('| Entity | File | Joins | Unique/PK |')
  lines.push('|--------|------|-------|-----------|')
  for (const row of graph.joinEntities ?? []) {
    const joins = row.joins
      .map((join) => {
        const field = join.fieldName ? `:${join.fieldName}` : ''
        const primary = join.primary ? ' primary' : ''
        return `\`${join.propertyName}→${join.target}${field}${primary}\``
      })
      .join(', ')
    const unique =
      row.uniquePropertySets?.length > 0
        ? row.uniquePropertySets
            .map((set) => set.map((prop) => `\`${prop}\``).join(' + '))
            .join('; ')
        : 'composite primary'
    lines.push(`| \`${row.className}\` | \`${row.fileName}\` | ${joins} | ${unique} |`)
  }

  lines.push('')
  lines.push(`## Linked through join table (${graph.linkRelations?.length ?? 0})`)
  lines.push('')
  lines.push('| Left | Right | Via | Fields | Constraint |')
  lines.push('|------|-------|-----|--------|------------|')
  for (const row of graph.linkRelations ?? []) {
    const fields = [
      row.leftFieldName ? `${row.leftProperty}:${row.leftFieldName}` : row.leftProperty,
      row.rightFieldName
        ? `${row.rightProperty}:${row.rightFieldName}`
        : row.rightProperty,
    ]
      .filter(Boolean)
      .map((field) => `\`${field}\``)
      .join(', ')
    const constraint =
      row.uniquePropertySets?.length > 0
        ? row.uniquePropertySets
            .map((set) => set.map((prop) => `\`${prop}\``).join(' + '))
            .join('; ')
        : row.primary
          ? 'composite primary'
          : '—'
    lines.push(
      `| \`${row.left}\` | \`${row.right}\` | \`${row.via}\` | ${fields} | ${constraint} |`,
    )
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
  lines.push('pnpm verify:module-graph')
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
  writeFileWithRetry(manifestAbs, `${JSON.stringify(graph, null, 2)}\n`)

  const md = formatEntityGraphMarkdown(graph)
  const mdAbs = path.join(root, MARKDOWN_REL)
  writeFileWithRetry(mdAbs, md)

  const graphifyMdAbs = path.join(root, MAIN_API_GRAPHIFY_MD)
  fs.mkdirSync(path.dirname(graphifyMdAbs), { recursive: true })
  writeFileWithRetry(graphifyMdAbs, md)

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
