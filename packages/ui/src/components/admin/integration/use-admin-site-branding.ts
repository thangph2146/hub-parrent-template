"use client"

import { useQuery } from "@tanstack/react-query"
import type { AdminSiteBranding } from "../types"

const DEFAULT_BRANDING: AdminSiteBranding = {
  siteName: "HUB",
  siteDescription: "Quản trị hệ thống",
}

export function useAdminSiteBranding(options: {
  queryKey: readonly unknown[]
  fetchBranding: () => Promise<AdminSiteBranding>
  defaults?: AdminSiteBranding
  staleTimeMs?: number
}) {
  const defaults = options.defaults ?? DEFAULT_BRANDING
  const { data } = useQuery({
    queryKey: options.queryKey,
    queryFn: options.fetchBranding,
    staleTime: options.staleTimeMs ?? 5 * 60 * 1000,
  })

  return {
    siteName: data?.siteName ?? defaults.siteName,
    siteDescription: data?.siteDescription ?? defaults.siteDescription,
  }
}
