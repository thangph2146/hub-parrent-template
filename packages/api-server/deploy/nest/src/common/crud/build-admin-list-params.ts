/** CRUD runtime — template local (pnpm api:sync-template). */
import type {
  BulkOperationResult,
  ListCrudParams,
} from './crud.types';
import { parseColumnFiltersFromQuery } from '../parse-column-filters';
import { parseAdminListLimit, parseAdminListPage } from '../parse-list-query';

export type AdminListQueryInput = {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  userId?: string;
  statusFilter?: string;
  updatedAtFrom?: string;
  updatedAtTo?: string;
  deletedAtFrom?: string;
  deletedAtTo?: string;
  query?: Record<string, string>;
  defaultLimit?: number;
};

/** Map query admin app → `ListCrudParams` của @workspace/api-server. */
export function buildAdminListCrudParams(
  input: AdminListQueryInput,
): ListCrudParams {
  const columnFilters = parseColumnFiltersFromQuery(input.query);
  return {
    page: parseAdminListPage(input.page),
    limit: parseAdminListLimit(input.limit, input.defaultLimit ?? 10),
    search: input.search?.trim(),
    status: (input.status as ListCrudParams['status']) ?? 'active',
    filters: {
      ...columnFilters,
      ...(input.userId?.trim() ? { userId: input.userId.trim() } : {}),
      ...(input.statusFilter != null && input.statusFilter !== ''
        ? { status: String(input.statusFilter) }
        : {}),
      ...(input.updatedAtFrom?.trim()
        ? { updatedAtFrom: input.updatedAtFrom.trim() }
        : {}),
      ...(input.updatedAtTo?.trim()
        ? { updatedAtTo: input.updatedAtTo.trim() }
        : {}),
      ...(input.deletedAtFrom?.trim()
        ? { deletedAtFrom: input.deletedAtFrom.trim() }
        : {}),
      ...(input.deletedAtTo?.trim()
        ? { deletedAtTo: input.deletedAtTo.trim() }
        : {}),
    },
  };
}

/** Số bản ghi bulk thành công — envelope admin vẫn dùng key `affected`. */
export function bulkAffectedCount(result: BulkOperationResult): number {
  return result.success;
}
