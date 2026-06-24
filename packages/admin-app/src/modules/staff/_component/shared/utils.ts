import type { ColumnFiltersState } from "@tanstack/react-table"
import { buildAdminFilterQuery, COMMON_FILTER_MAPPINGS } from "@workspace/admin-app/lib"

export function buildUsersFilterQuery(
  columnFilters: ColumnFiltersState
): Record<string, string> {
  return buildAdminFilterQuery(columnFilters, COMMON_FILTER_MAPPINGS.users)
}
