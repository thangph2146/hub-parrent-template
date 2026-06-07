import type { TreeOption } from "@ui/components/pickers"
import type { SeoMetaRow } from "@/app/seo-metas/_component"
import {
  SETTINGS_SEO_PAGES_PRESET_GROUPS,
  type SettingsSeoPagesPresetGroup,
} from "./settings-seo-pages-presets"

export type SeoMetaTreeRow = SeoMetaRow & {
  isGroup?: boolean
  groupLabel?: string
  childCount?: number
  isPlaceholder?: boolean
  subRows?: SeoMetaTreeRow[]
}

const EMPTY_SEO_FIELDS = {
  title: null,
  description: null,
  keywords: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  status: 1,
  createdAt: "",
  updatedAt: "",
  deletedAt: null,
} satisfies Pick<
  SeoMetaRow,
  | "title"
  | "description"
  | "keywords"
  | "ogTitle"
  | "ogDescription"
  | "ogImage"
  | "status"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>

function countTreeLeaves(rows: SeoMetaTreeRow[]): number {
  return rows.reduce((sum, row) => {
    if (row.isGroup) return sum + countTreeLeaves(row.subRows ?? [])
    return sum + 1
  }, 0)
}

function makeGroupRow(
  id: string,
  label: string,
  subRows: SeoMetaTreeRow[],
): SeoMetaTreeRow {
  return {
    id,
    page: label,
    groupLabel: label,
    isGroup: true,
    childCount: countTreeLeaves(subRows),
    subRows,
    ...EMPTY_SEO_FIELDS,
  }
}

function buildNodeRows(
  nodes: TreeOption[],
  group: SettingsSeoPagesPresetGroup,
  byPage: Map<string, SeoMetaRow>,
  usedPages: Set<string>,
): SeoMetaTreeRow[] {
  return nodes.flatMap((node) => {
    if (node.children?.length) {
      const subRows = buildNodeRows(node.children, group, byPage, usedPages)
      if (!subRows.length) return []
      return [
        makeGroupRow(`group:${group.id}:${node.value}`, node.label, subRows),
      ]
    }

    const page = node.value
    if (!(page in group.pages)) return []

    const existing = byPage.get(page)
    if (existing) {
      usedPages.add(page)
      return [{ ...existing }]
    }

    return [
      {
        id: `placeholder:${group.id}:${page}`,
        page,
        isPlaceholder: true,
        ...EMPTY_SEO_FIELDS,
      },
    ]
  })
}

/** Gộp SEO metadata vào cây route preset (HUB Parent + Check-in). */
export function buildSettingsSeoPagesTree(
  rows: SeoMetaRow[],
): SeoMetaTreeRow[] {
  const byPage = new Map(rows.map((row) => [row.page, row]))
  const usedPages = new Set<string>()

  const roots = SETTINGS_SEO_PAGES_PRESET_GROUPS.flatMap((group) => {
    const subRows = buildNodeRows(group.tree, group, byPage, usedPages)
    if (!subRows.length) return []
    return [makeGroupRow(`group:${group.id}:root`, group.label, subRows)]
  })

  const orphans = rows.filter((row) => !usedPages.has(row.page))
  if (orphans.length > 0) {
    roots.push(
      makeGroupRow(
        "group:other:root",
        "Trang khác",
        orphans.map((row) => ({ ...row })),
      ),
    )
  }

  return roots
}

export function isSeoMetaTreeDataRow(row: SeoMetaTreeRow): row is SeoMetaRow {
  return !row.isGroup && !row.isPlaceholder
}
