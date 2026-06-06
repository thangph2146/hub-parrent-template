import type { UseQueryResult } from "@tanstack/react-query";
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@/lib/fetch-all-admin-list";
import {
  adminDetailPlaceholderFromList,
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@/lib/admin-detail-query";
import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client";
import type { CourseDetail, CourseRow } from "../types";

export const courseDetailQueryKey = (id: string) =>
  ["courses", "detail", id] as const;

export function prefetchCourseDetail(
  queryClient: QueryClient,
  apiParam: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    courseDetailQueryKey(id),
    () => apiParam.courses.get<CourseDetail>(id)
  );
}

export function useCourseDetailQuery(
  apiParam: StoreSyncSdk,
  id: string,
): UseQueryResult<CourseDetail> {
  const queryClient = useQueryClient();

  return useQuery({
    ...adminDetailQueryOptions(
      courseDetailQueryKey(id),
      async () => apiParam.courses.get<CourseDetail>(id),
      id
    ),
    placeholderData: () =>
      adminDetailPlaceholderFromList<CourseRow, CourseDetail>(
        queryClient,
        ["courses", "list"],
        id,
        (row) => row as unknown as CourseDetail
      ),
  });
}

export function useCoursesListQuery(
  apiParam: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>,
): UseQueryResult<CourseRow[]> {
  return useQuery({
    queryKey: ["courses", "list", filters],
    queryFn: async (): Promise<CourseRow[]> => {
      const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT;
      const items: CourseRow[] = [];
      let page = 1;
      let total = Number.POSITIVE_INFINITY;

      while (items.length < total) {
        const result = await apiParam.courses.list<CourseRow>({ page, limit, status: "active", filters });
        items.push(...result.items);
        total = result.total;
        if (result.items.length === 0) break;
        page += 1;
      }

      return items;
    },
    enabled,
  });
}

export interface UseTrashQueryProps {
  api: StoreSyncSdk;
  trashPage: number;
  trashPageSize: number;
  debouncedTrashQ: string;
  enabled: boolean;
}

export function useCoursesTrashQuery({
  api: apiParam,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: UseTrashQueryProps & { filters?: Record<string, string> }): UseQueryResult<PagedResult<CourseRow>> {
  return useQuery({
    queryKey: ["courses", "trash", trashPage, trashPageSize, debouncedTrashQ, filters],
    enabled,
    queryFn: async (): Promise<PagedResult<CourseRow>> => {
      return apiParam.courses.list<CourseRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        ...filters,
      });
    },
  });
}
