import { useQuery } from "@tanstack/react-query"
import { api } from "@workspace/admin-app/lib/api"
import { parseHanetPlacesResponse } from "@workspace/admin-app/lib/hanet-place-parse"

export function hanetPlacesQueryKey() {
  return ["hanet", "places"] as const
}

export function useHanetPlacesQuery(enabled = true) {
  return useQuery({
    queryKey: hanetPlacesQueryKey(),
    queryFn: async () => {
      const data = await api.hanet.listPlaces()
      return parseHanetPlacesResponse(data)
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
