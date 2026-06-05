"use client"

import { useMemo, type ReactNode } from "react"
import {
  AdminLayoutBridge,
  buildAdminLayoutValue,
  fetchAdminSettingsBranding,
  useAdminSiteBranding,
} from "@ui/components/admin"
import { api } from "@/lib/api"
import { BACKEND_ADMIN_LAYOUT_STATIC } from "@/config/admin-layout-static"
import { useAuth, useClientReady } from "@/providers/auth-provider"

export function BackendAdminLayoutProvider({ children }: { children: ReactNode }) {
  const clientReady = useClientReady()
  const { user, logout } = useAuth()
  const brandingDefaults = {
    siteName: "HUB Parent",
    siteDescription: "Quản trị hệ thống",
  } as const

  const branding = useAdminSiteBranding({
    queryKey: ["settings", "site-config", user?.id ?? "guest"],
    enabled: clientReady && !!user,
    fetchBranding: () =>
      fetchAdminSettingsBranding(
        (path: string) => api.http.get(path),
        brandingDefaults
      ),
    defaults: brandingDefaults,
  })

  const value = useMemo(
    () =>
      buildAdminLayoutValue({
        user: user ?? null,
        clientReady,
        logout,
        branding,
        static: BACKEND_ADMIN_LAYOUT_STATIC,
      }),
    [branding, clientReady, logout, user],
  )

  return <AdminLayoutBridge value={value}>{children}</AdminLayoutBridge>
}
