import { adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list";
import type { StoreSyncSdk } from "@workspace/api-client";
import type { DepartmentDetail, DepartmentRow } from "../types";


export const departmentDetailQueryKey = (id: string) =>
  ["departments", "detail", id] as const;

export function prefetchDepartmentDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    departmentDetailQueryKey(id),
    () => api.departments.get<DepartmentDetail>(id)
  );
}

export function useDepartmentDetailQuery(
  api: StoreSyncSdk,
  id: string
) {
  return useQuery({
    ...adminDetailQueryOptions(
      departmentDetailQueryKey(id),
      async () => api.departments.get<DepartmentDetail>(id),
      id
    ),
});
}

export function useDepartmentsListQuery(api: StoreSyncSdk, enabled: boolean, filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["departments", "list", filters],
    queryFn: async () => {
      const items: DepartmentRow[] = [];
      let page = 1, total = Infinity;
      while (items.length < total) {
        const r = await api.departments.list<DepartmentRow>({ page, limit: ADMIN_LIST_EXPORT_FETCH_LIMIT, status: "active", filters });
        items.push(...r.items);
        total = r.total;
        if (!r.items.length) break;
        page++;
      }
      return items;
    },
    enabled,
  });
}

export function useDepartmentsTrashQuery({ api, trashPage, trashPageSize, debouncedTrashQ, enabled, filters }: {
  api: StoreSyncSdk; trashPage: number; trashPageSize: number; debouncedTrashQ: string; enabled: boolean; filters?: Record<string, string>;
}) {
  return useQuery({
    queryKey: ["departments", "trash", trashPage, trashPageSize, debouncedTrashQ, filters],
    enabled,
    queryFn: () => api.departments.list<DepartmentRow>({
      page: trashPage, limit: trashPageSize, search: debouncedTrashQ.trim() || undefined, status: "deleted", filters,
    }),
  });
}
