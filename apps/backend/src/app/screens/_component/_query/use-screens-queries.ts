import {
  adminDetailPlaceholderFromList,
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list";
import type { StoreSyncSdk } from "@workspace/api-client";
import type { ScreenDetail, ScreenRow } from "../types";

export const screenDetailQueryKey = (id: string) =>
  ["screens", "detail", id] as const;

export function prefetchScreenDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    screenDetailQueryKey(id),
    () => api.screens.get<ScreenDetail>(id)
  );
}

export function useScreenDetailQuery(
  api: StoreSyncSdk,
  id: string
) {
  const queryClient = useQueryClient();

  return useQuery({
    ...adminDetailQueryOptions(
      screenDetailQueryKey(id),
      async () => api.screens.get<ScreenDetail>(id),
      id
    ),
    placeholderData: () =>
      adminDetailPlaceholderFromList<ScreenRow, ScreenDetail>(
        queryClient,
        ["screens", "list"],
        id,
        (row) => row as unknown as ScreenDetail
      ),
  });
}
export function useScreensListQuery(api: StoreSyncSdk, enabled: boolean, filters?: Record<string, string>) { return useQuery({ queryKey: ["screens", "list", filters], queryFn: async () => { const items: ScreenRow[] = []; let page = 1, total = Infinity; while (items.length < total) { const r = await api.screens.list<ScreenRow>({ page, limit: ADMIN_LIST_EXPORT_FETCH_LIMIT, status: "active", filters }); items.push(...r.items); total = r.total; if (!r.items.length) break; page++; } return items; }, enabled }); }
export function useScreensTrashQuery({ api, trashPage, trashPageSize, debouncedTrashQ, enabled, filters }: { api: StoreSyncSdk; trashPage: number; trashPageSize: number; debouncedTrashQ: string; enabled: boolean; filters?: Record<string, string>; }) { return useQuery({ queryKey: ["screens", "trash", trashPage, trashPageSize, debouncedTrashQ, filters], enabled, queryFn: () => api.screens.list<ScreenRow>({ page: trashPage, limit: trashPageSize, search: debouncedTrashQ.trim() || undefined, status: "deleted", filters }) }); }
