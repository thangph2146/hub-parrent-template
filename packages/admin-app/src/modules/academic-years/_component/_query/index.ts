import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@workspace/admin-app/lib/fetch-all-admin-list"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk, PagedResult } from "@workspace/api-client"
import type { AcademicYearDetail, AcademicYearRow } from "../shared/types"

export const academicYearDetailQueryKey = (id: string) =>
  ["academic-years", "detail", id] as const

export function prefetchAcademicYearDetail(
  queryClient: QueryClient,
  apiParam: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    academicYearDetailQueryKey(id),
    () => apiParam.academicYears.get<AcademicYearDetail>(id)
  )
}

export function useAcademicYearDetailQuery(apiParam: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      academicYearDetailQueryKey(id),
      async () => apiParam.academicYears.get<AcademicYearDetail>(id),
      id
    ),
  })
}

export function useAcademicYearsListQuery(
  apiParam: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
): UseQueryResult<AcademicYearRow[]> {
  return useQuery({
    queryKey: ["academic-years", "list", filters],
    queryFn: async (): Promise<AcademicYearRow[]> => {
      const limit = ADMIN_LIST_EXPORT_FETCH_LIMIT
      const items: AcademicYearRow[] = []
      let page = 1
      let total = Number.POSITIVE_INFINITY

      while (items.length < total) {
        const result = await apiParam.academicYears.list<AcademicYearRow>({
          page,
          limit,
          status: "active",
          filters,
        })
        items.push(...result.items)
        total = result.total
        if (result.items.length === 0) break
        page += 1
      }

      return items
    },
    enabled,
  })
}

export interface UseTrashQueryProps {
  api: StoreSyncSdk
  trashPage: number
  trashPageSize: number
  debouncedTrashQ: string
  enabled: boolean
}

export function useAcademicYearsTrashQuery({
  api: apiParam,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: UseTrashQueryProps & { filters?: Record<string, string> }): UseQueryResult<
  PagedResult<AcademicYearRow>
> {
  return useQuery({
    queryKey: [
      "academic-years",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: async (): Promise<PagedResult<AcademicYearRow>> => {
      return apiParam.academicYears.list<AcademicYearRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        ...filters,
      })
    },
  })
}
