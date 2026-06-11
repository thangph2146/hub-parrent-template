"use client"
import { api } from "@workspace/admin-app/lib/api"
import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import type { UseQueryResult } from "@tanstack/react-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import type { StoreSyncSdk } from "@workspace/api-client"
import type { GuideGroup, ListResult } from "../types"
import { PAGE_KEY } from "../utils"

export interface UseGuidesQueryProps {
  api: StoreSyncSdk
  page: number
  limit?: number
  search?: string
  filters?: Record<string, string>
}

export function useGuidesQuery({
  api,
  page,
  limit = 50,
  search = "",
  filters,
}: UseGuidesQueryProps): UseQueryResult<ListResult> {
  return useQuery({
    queryKey: ["admin", "guides", page, search, filters],
    queryFn: async (): Promise<ListResult> => {
      const payload = await api.guides.list<GuideGroup>({
        page,
        limit,
        search: search.trim() || PAGE_KEY,
        filters,
      })
      return {
        data: payload.items,
        pagination: {
          page,
          limit,
          total: payload.total,
          totalPages: Math.ceil(payload.total / limit),
        },
      }
    },
  })
}

export const guideDetailQueryKey = (guideId: string) =>
  ["guides", "detail", guideId] as const

export function prefetchGuideDetail(
  queryClient: QueryClient,
  apiParam: StoreSyncSdk,
  guideId: string
) {
  return prefetchAdminDetailQuery(
    queryClient,
    guideDetailQueryKey(guideId),
    () => apiParam.guides.get<GuideGroup>(guideId)
  )
}

export function useGuideDetailQuery(apiParam: StoreSyncSdk, guideId: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      guideDetailQueryKey(guideId),
      async () => apiParam.guides.get<GuideGroup>(guideId),
      guideId
    ),
  })
}
