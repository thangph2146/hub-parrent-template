/**
 * Verify chuẩn liên kết entity MikroORM:
 * - Không dùng @ManyToMany trực tiếp, luôn đi qua join entity.
 * - Join entity phải có >= 2 ManyToOne và unique/composite primary.
 * - Manifest phải sinh linkRelations để graph đọc được A ↔ B qua bảng nối.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { ROOT } = require('../lib/monorepo-root.cjs')
const { MANIFEST_REL } = require('../lib/graph/entity-graph-manifest.cjs')

function fail(message) {
  console.error(`[verify:entity-links] FAIL: ${message}`)
  process.exit(1)
}

function linkKey(left, right, via) {
  return `${left}:${right}:${via}`
}

function main() {
  const manifestPath = path.join(ROOT, MANIFEST_REL)
  if (!fs.existsSync(manifestPath)) {
    fail(`Thiếu ${MANIFEST_REL} — chạy pnpm api:sync-template`)
  }

  const graph = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const relationEdgesDetailed = graph.relationEdgesDetailed ?? []
  const joinEntities = graph.joinEntities ?? []
  const linkRelations = graph.linkRelations ?? []

  const directManyToMany = relationEdgesDetailed.filter(
    (edge) => edge.kind === 'ManyToMany',
  )
  if (directManyToMany.length > 0) {
    const sample = directManyToMany
      .map((edge) => `${edge.from}.${edge.propertyName ?? '?'} -> ${edge.to}`)
      .join(', ')
    fail(
      `Không dùng @ManyToMany trực tiếp; hãy tạo join entity như UserRole. Vi phạm: ${sample}`,
    )
  }

  for (const joinEntity of joinEntities) {
    const joins = joinEntity.joins ?? []
    if (joins.length < 2) {
      fail(`${joinEntity.className}: join entity phải có ít nhất 2 ManyToOne`)
    }

    const hasCompositePrimary = joins.filter((join) => join.primary).length >= 2
    const hasUniquePair = (joinEntity.uniquePropertySets ?? []).some((set) => {
      const joinProps = joins.map((join) => join.propertyName).filter(Boolean)
      return set.filter((prop) => joinProps.includes(prop)).length >= 2
    })
    if (!hasCompositePrimary && !hasUniquePair) {
      fail(
        `${joinEntity.className}: join entity phải có composite primary hoặc @Unique trên các relation`,
      )
    }
  }

  const linkSet = new Set(
    linkRelations.map((link) => linkKey(link.left, link.right, link.via)),
  )
  for (const joinEntity of joinEntities) {
    const joins = (joinEntity.joins ?? []).filter((join) => join.target)
    for (let i = 0; i < joins.length; i += 1) {
      for (let j = i + 1; j < joins.length; j += 1) {
        const expected = linkKey(
          joins[i].target,
          joins[j].target,
          joinEntity.className,
        )
        if (!linkSet.has(expected)) {
          fail(`${joinEntity.className}: thiếu linkRelations ${expected}`)
        }
      }
    }
  }

  const requiredLinks = [
    linkKey('User', 'Role', 'UserRole'),
    linkKey('User', 'Student', 'ParentStudent'),
  ]
  for (const required of requiredLinks) {
    if (!linkSet.has(required)) {
      fail(`Thiếu quan hệ chuẩn bắt buộc: ${required}`)
    }
  }

  console.log(
    `[verify:entity-links] PASS (${joinEntities.length} join entities, ${linkRelations.length} linked relations)`,
  )
}

main()
