import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib"

export {
  slugify,
  formatDateTime,
  buildCategoryOptionTree,
  buildCategoryTree,
  unwrapApiEnvelope as unwrapEnvelope,
  normalizePagedResult as normalizePaged,
  type CategoryTreeNode,
} from "@workspace/api-client"

import type { CategoryRow } from "./types"

export function normalizeCategoryRow(raw: CategoryRow): CategoryRow {
  return {
    ...raw,
    id: String(raw.id),
    parentId:
      raw.parentId != null && raw.parentId !== ""
        ? String(raw.parentId)
        : null,
  }
}

export function buildCategoriesFilterQuery(
  columnFilters: { id: string; value: unknown }[]
): Record<string, string> {
  return buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.categories)
}
