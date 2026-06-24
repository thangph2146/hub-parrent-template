import { useAdminApi } from "@workspace/admin-app/runtime"
import { useQuery } from "@tanstack/react-query"

export function hanetAvatarsQueryKey(params: {
  page: number
  limit: number
  search: string
}) {
  return ["hanet", "avatars", "page", params] as const
}

export function useHanetAvatarsQuery(params: {
  page: number
  limit: number
  search: string
  enabled?: boolean
}) {
  const api = useAdminApi()
  return useQuery({
    queryKey: hanetAvatarsQueryKey(params),
    queryFn: () =>
      api.hanet.listStoredAvatars({
        page: params.page,
        limit: params.limit,
        search: params.search.trim() || undefined,
      }),
    enabled: params.enabled !== false,
  })
}
