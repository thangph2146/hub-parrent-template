import {
  adminDetailPlaceholderFromList,
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client";
import type { CategoryDetail, CategoryRow } from "../types";


export const categoryDetailQueryKey = (categoryId: string) =>
  ["categories", "detail", categoryId] as const;

export function prefetchCategoryDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  categoryId: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    categoryDetailQueryKey(categoryId),
    () => api.categories.rawGet<CategoryDetail>(categoryId)
  );
}

export function useCategoryDetailQuery(
  api: StoreSyncSdk,
  categoryId: string
) {
  const queryClient = useQueryClient();

  return useQuery({
    ...adminDetailQueryOptions(
      categoryDetailQueryKey(categoryId),
      async () => api.categories.rawGet<CategoryDetail>(categoryId),
      categoryId
    ),
    placeholderData: () =>
      adminDetailPlaceholderFromList<CategoryRow, CategoryDetail>(
        queryClient,
        ["categories", "list"],
        categoryId,
        (row) => row as unknown as CategoryDetail
      ),
  });
}

export interface UseCategoriesQueryProps {
  api: StoreSyncSdk;
  debouncedQ: string;
  columnFilterQuery: Record<string, unknown>;
}

export function useCategoriesQuery({
  api,
  debouncedQ,
  columnFilterQuery,
}: UseCategoriesQueryProps): UseQueryResult<PagedResult<CategoryRow>> {
  return useQuery({
    queryKey: ["categories", "list", debouncedQ, columnFilterQuery],
    queryFn: async (): Promise<PagedResult<CategoryRow>> =>
      api.categories.rawList<CategoryRow>({
        page: 1,
        limit: 1000,
        q: debouncedQ.trim() || undefined,
        status: "active",
        filters: columnFilterQuery,
      }),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export interface UseTrashQueryProps {
  api: StoreSyncSdk;
  trashPage: number;
  trashPageSize: number;
  debouncedTrashQ: string;
  trashColumnFilterQuery?: Record<string, unknown>;
  enabled: boolean;
}

export function useTrashQuery({
  api,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  trashColumnFilterQuery,
  enabled,
}: UseTrashQueryProps): UseQueryResult<PagedResult<CategoryRow>> {
  return useQuery({
    queryKey: ["categories", "trash", trashPage, trashPageSize, debouncedTrashQ, trashColumnFilterQuery],
    enabled,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<PagedResult<CategoryRow>> =>
      api.categories.rawList<CategoryRow>({
        page: trashPage,
        limit: trashPageSize,
        q: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        filters: trashColumnFilterQuery,
      }),
  });
}

function normalizeCategoryRow(raw: CategoryRow): CategoryRow {
  return {
    ...raw,
    id: String(raw.id),
    parentId: raw.parentId != null ? String(raw.parentId) : null,
  };
}

export function useCategoriesOptionsQuery(
  api: StoreSyncSdk
): UseQueryResult<CategoryRow[]> {
  return useQuery({
    queryKey: ["categories", "options"],
    queryFn: async (): Promise<CategoryRow[]> => {
      const paged = await api.categories.rawList<CategoryRow>({
        page: 1,
        limit: 1000,
        status: "active",
      });
      return paged.items.map(normalizeCategoryRow);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
