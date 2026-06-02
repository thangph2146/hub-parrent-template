"use client"

import { useMemo, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AdminLayoutProvider,
  type AdminLayoutContextValue,
} from "@ui/components/admin"
import { canAccessStaffAdmin } from "@workspace/api-client"
import { BACKEND_ADMIN_MENU_TREE } from "@/config/admin-menu-tree"
import { api } from "@/lib/api"
import {
  ADMIN_SESSION_EVENT,
  clearAdminSession,
} from "@/lib/auth-session"
import { AUTH_LOGIN_PATH, isAuthPath } from "@/lib/auth-routes"
import { useAuth, useClientReady } from "@/providers/auth-provider"

function useAdminSiteBranding() {
  const { data } = useQuery({
    queryKey: ["settings", "site-config"],
    queryFn: async () => {
      const [nameRes, descRes] = await Promise.all([
        api.http.get("/admin/settings/site_name"),
        api.http.get("/admin/settings/site_description"),
      ])
      const extract = (res: unknown, fallback: string): string => {
        const e = res as { data?: { value?: unknown }; value?: unknown }
        const raw = e.data?.value ?? e.value
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw)
            return typeof parsed === "string" ? parsed : raw
          } catch {
            return raw
          }
        }
        return fallback
      }
      return {
        siteName: extract(nameRes, "HUB Parent"),
        siteDescription: extract(descRes, "Quản trị hệ thống"),
      }
    },
    staleTime: 5 * 60 * 1000,
  })
  return {
    siteName: data?.siteName ?? "HUB Parent",
    siteDescription: data?.siteDescription ?? "Quản trị hệ thống",
  }
}

export function BackendAdminLayoutProvider({ children }: { children: ReactNode }) {
  const clientReady = useClientReady()
  const { user, logout } = useAuth()
  const { siteName, siteDescription } = useAdminSiteBranding()

  const value = useMemo<AdminLayoutContextValue>(
    () => ({
      user: user ?? null,
      clientReady,
      logout,
      menuTree: BACKEND_ADMIN_MENU_TREE,
      siteName,
      siteDescription,
      loginPath: AUTH_LOGIN_PATH,
      isAuthPath,
      canAccessApp: canAccessStaffAdmin,
      clearSession: clearAdminSession,
      sessionEventName: ADMIN_SESSION_EVENT,
      mobileHeaderTitle: "B2B Admin",
      fullWidthPaths: ["/graph"],
    }),
    [clientReady, logout, siteDescription, siteName, user],
  )

  return <AdminLayoutProvider value={value}>{children}</AdminLayoutProvider>
}
