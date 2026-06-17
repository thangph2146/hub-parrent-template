"use client"

import { useQuery } from "@tanstack/react-query"
import type { AdminSiteBranding } from "../types"
import { ADMIN_BRANDING_FALLBACK } from "./admin-branding-fallbacks"

export type AdminSiteBrandingState = AdminSiteBranding & {
  /** Đã fetch xong (có data hoặc lỗi) — dùng để tránh flash fallback sai trên màn loading. */
  isReady: boolean
}

export function useAdminSiteBranding(options: {
  queryKey: readonly unknown[]
  fetchBranding: (ctx: { signal: AbortSignal }) => Promise<AdminSiteBranding>
  defaults?: AdminSiteBranding
  enabled?: boolean
}): AdminSiteBrandingState {
  const defaults = options.defaults ?? ADMIN_BRANDING_FALLBACK

  const { data, isFetched } = useQuery({
    queryKey: options.queryKey,
    queryFn: ({ signal }) => options.fetchBranding({ signal }),
    enabled: options.enabled ?? true,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })

  const resolved = data ?? (isFetched ? defaults : undefined)

  return {
    siteName: resolved?.siteName ?? "",
    siteDescription: resolved?.siteDescription ?? "",
    authHeroImage: resolved?.authHeroImage ?? null,
    isReady: Boolean(data) || isFetched,
  }
}
