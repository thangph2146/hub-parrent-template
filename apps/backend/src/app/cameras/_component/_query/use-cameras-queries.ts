import { adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list";
import type { StoreSyncSdk } from "@workspace/api-client";
import type { CameraDetail, CameraRow } from "../types";

export const cameraDetailQueryKey = (id: string) =>
  ["cameras", "detail", id] as const;

export function prefetchCameraDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    cameraDetailQueryKey(id),
    () => api.cameras.get<CameraDetail>(id)
  );
}

export function useCameraDetailQuery(
  api: StoreSyncSdk,
  id: string
) {
  return useQuery({
    ...adminDetailQueryOptions(
      cameraDetailQueryKey(id),
      async () => api.cameras.get<CameraDetail>(id),
      id
    ),
});
}
export function useCamerasListQuery(api: StoreSyncSdk, enabled: boolean, filters?: Record<string, string>) { return useQuery({ queryKey: ["cameras", "list", filters], queryFn: async () => { const items: CameraRow[] = []; let page = 1, total = Infinity; while (items.length < total) { const r = await api.cameras.list<CameraRow>({ page, limit: ADMIN_LIST_EXPORT_FETCH_LIMIT, status: "active", filters }); items.push(...r.items); total = r.total; if (!r.items.length) break; page++; } return items; }, enabled }); }
export function useCamerasTrashQuery({ api, trashPage, trashPageSize, debouncedTrashQ, enabled, filters }: { api: StoreSyncSdk; trashPage: number; trashPageSize: number; debouncedTrashQ: string; enabled: boolean; filters?: Record<string, string>; }) { return useQuery({ queryKey: ["cameras", "trash", trashPage, trashPageSize, debouncedTrashQ, filters], enabled, queryFn: () => api.cameras.list<CameraRow>({ page: trashPage, limit: trashPageSize, search: debouncedTrashQ.trim() || undefined, status: "deleted", filters }) }); }
