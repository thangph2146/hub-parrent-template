"use client"

import { useQuery } from "@tanstack/react-query"
import type { AdminPublicSiteSeo } from "../types"

export function useAdminPublicSiteSeo(options: {
  queryKey: readonly unknown[]
  page: string
  fetchSiteSeo: (ctx: {
    signal: AbortSignal
    page: string
  }) => Promise<AdminPublicSiteSeo | null>
  enabled?: boolean
}) {
  const { data, isFetched } = useQuery({
    queryKey: options.queryKey,
    queryFn: ({ signal }) =>
      options.fetchSiteSeo({ signal, page: options.page }),
    enabled: options.enabled ?? true,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })

  return {
    data: data ?? null,
    isReady: isFetched,
  }
}
