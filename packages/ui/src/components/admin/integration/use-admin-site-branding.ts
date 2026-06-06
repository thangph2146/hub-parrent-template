"use client"

import { useQuery } from "@tanstack/react-query"
import type { AdminSiteBranding } from "../types"

const DEFAULT_BRANDING: AdminSiteBranding = {
  siteName: "HUB",
  siteDescription: "Quản trị hệ thống",
}

export function useAdminSiteBranding(options: {
  queryKey: readonly unknown[]
  fetchBranding: (ctx: { signal: AbortSignal }) => Promise<AdminSiteBranding>
  defaults?: AdminSiteBranding
  staleTimeMs?: number
  /** false khi chưa đăng nhập — tránh gọi /admin/settings (401 thiếu X-User-Id). */
  enabled?: boolean
}) {
  const defaults = options.defaults ?? DEFAULT_BRANDING
  const { data } = useQuery({
    queryKey: options.queryKey,
    queryFn: ({ signal }) => options.fetchBranding({ signal }),
    enabled: options.enabled ?? true,
    staleTime: options.staleTimeMs ?? 5 * 60 * 1000,
    retry: false,
  })

  return {
    siteName: data?.siteName ?? defaults.siteName,
    siteDescription: data?.siteDescription ?? defaults.siteDescription,
  }
}
