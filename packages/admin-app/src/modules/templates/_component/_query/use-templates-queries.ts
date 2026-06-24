import {
  adminDetailQueryOptions,
  prefetchAdminDetailQuery,
} from "@workspace/admin-app/lib/admin-detail-query"
import { useQuery, type QueryClient } from "@tanstack/react-query"
import { ADMIN_LIST_EXPORT_FETCH_LIMIT } from "@workspace/admin-app/lib/fetch-all-admin-list"
import type { StoreSyncSdk } from "@workspace/api-client"
import type { TemplateDetail, TemplateRow } from "../shared/types"

export const templateDetailQueryKey = (id: string) =>
  ["templates", "detail", id] as const

export function prefetchTemplateDetail(
  queryClient: QueryClient,
  api: StoreSyncSdk,
  id: string
) {
  return prefetchAdminDetailQuery(queryClient, templateDetailQueryKey(id), () =>
    api.templates.get<TemplateDetail>(id)
  )
}

export function useTemplateDetailQuery(api: StoreSyncSdk, id: string) {
  return useQuery({
    ...adminDetailQueryOptions(
      templateDetailQueryKey(id),
      async () => api.templates.get<TemplateDetail>(id),
      id
    ),
  })
}
export function useTemplatesListQuery(
  api: StoreSyncSdk,
  enabled: boolean,
  filters?: Record<string, string>
) {
  return useQuery({
    queryKey: ["templates", "list", filters],
    queryFn: async () => {
      const items: TemplateRow[] = []
      let page = 1,
        total = Infinity
      while (items.length < total) {
        const r = await api.templates.list<TemplateRow>({
          page,
          limit: ADMIN_LIST_EXPORT_FETCH_LIMIT,
          status: "active",
          filters,
        })
        items.push(...r.items)
        total = r.total
        if (!r.items.length) break
        page++
      }
      return items
    },
    enabled,
  })
}
export function useTemplatesTrashQuery({
  api,
  trashPage,
  trashPageSize,
  debouncedTrashQ,
  enabled,
  filters,
}: {
  api: StoreSyncSdk
  trashPage: number
  trashPageSize: number
  debouncedTrashQ: string
  enabled: boolean
  filters?: Record<string, string>
}) {
  return useQuery({
    queryKey: [
      "templates",
      "trash",
      trashPage,
      trashPageSize,
      debouncedTrashQ,
      filters,
    ],
    enabled,
    queryFn: () =>
      api.templates.list<TemplateRow>({
        page: trashPage,
        limit: trashPageSize,
        search: debouncedTrashQ.trim() || undefined,
        status: "deleted",
        filters,
      }),
  })
}
