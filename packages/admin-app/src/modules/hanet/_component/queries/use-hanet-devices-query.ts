import { useAdminApi } from "@workspace/admin-app/runtime"
import { useQuery } from "@tanstack/react-query"
import { parseHanetDevicesResponse } from "../shared/hanet-device-parse"

export function hanetDevicesQueryKey(placeId: string) {
  return ["hanet", "devices", placeId] as const
}

export function useHanetDevicesQuery(placeId: string, enabled = true) {
  const api = useAdminApi()
  return useQuery({
    queryKey: hanetDevicesQueryKey(placeId),
    queryFn: async () => {
      const data = await api.hanet.listDevices(placeId || undefined)
      return parseHanetDevicesResponse(data)
    },
    enabled: enabled && Boolean(placeId.trim()),
    staleTime: 2 * 60 * 1000,
  })
}
