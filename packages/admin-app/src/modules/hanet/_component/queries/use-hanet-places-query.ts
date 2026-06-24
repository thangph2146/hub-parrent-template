import { useAdminApi } from "@workspace/admin-app/runtime"
import { useQuery } from "@tanstack/react-query"
import { parseHanetPlacesResponse } from "../shared/hanet-place-parse"
import type { HanetPlaceOption } from "../shared/hanet-place-parse"

export function hanetPlacesQueryKey() {
  return ["hanet", "places"] as const
}

export function useHanetPlacesQuery(enabled = true) {
  const api = useAdminApi()
  return useQuery<HanetPlaceOption[]>({
    queryKey: hanetPlacesQueryKey(),
    queryFn: async () => {
      const data = await api.hanet.listPlaces()
      return parseHanetPlacesResponse(data)
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
