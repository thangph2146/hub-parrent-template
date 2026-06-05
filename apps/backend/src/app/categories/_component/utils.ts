import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@/lib";

export {
  slugify,
  formatDateTime,
  buildCategoryOptionTree,
  unwrapApiEnvelope as unwrapEnvelope,
  normalizePagedResult as normalizePaged,
  type CategoryTreeNode,
} from "@workspace/api-client";

export function buildCategoriesFilterQuery(
  columnFilters: { id: string; value: unknown }[],
): Record<string, string> {
  return buildAdminFilterQuery(
    columnFilters,
    COMMON_FILTER_MAPPINGS.categories,
  );
}
