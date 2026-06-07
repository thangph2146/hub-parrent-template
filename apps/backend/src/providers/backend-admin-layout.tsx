"use client"

import { useMemo, type ReactNode } from "react"
import {
  ADMIN_PUBLIC_BRANDING_QUERY_KEY,
  ADMIN_PUBLIC_SITE_SEO_QUERY_KEY,
  ADMIN_SITE_SEO_PAGE_KEY,
  AdminLayoutBridge,
  buildAdminLayoutValue,
  useAdminDocumentHeadOverride,
  useAdminDocumentTitle,
  useAdminPublicSiteSeo,
  useAdminSiteBranding,
} from "@ui/components/admin"
import { api } from "@/lib/api"
import { BACKEND_ADMIN_LAYOUT_STATIC } from "@/config/admin-layout-static"
import { AdminRealtimeSync } from "@/components/admin-realtime-sync"
import { useAuth, useClientReady } from "@/providers/auth-provider"

export function BackendAdminLayoutProvider({ children }: { children: ReactNode }) {
  const clientReady = useClientReady()
  const { user, logout } = useAuth()

  const branding = useAdminSiteBranding({
    queryKey: ADMIN_PUBLIC_BRANDING_QUERY_KEY,
    fetchBranding: ({ signal }) =>
      api.settings.getPublicBranding({ signal }),
  })

  const siteSeo = useAdminPublicSiteSeo({
    queryKey: ADMIN_PUBLIC_SITE_SEO_QUERY_KEY,
    page: ADMIN_SITE_SEO_PAGE_KEY,
    fetchSiteSeo: ({ signal, page }) =>
      api.seoMetas.getPublicByPage(page, { signal }),
  })

  const documentHeadOverride = useAdminDocumentHeadOverride()

  useAdminDocumentTitle({
    siteName: documentHeadOverride?.siteName ?? branding.siteName,
    siteDescription:
      documentHeadOverride?.siteDescription ?? branding.siteDescription,
    metaTitle:
      documentHeadOverride?.metaTitle ??
      (siteSeo.isReady ? siteSeo.data?.title : undefined),
    metaDescription:
      documentHeadOverride?.metaDescription ??
      (siteSeo.isReady ? siteSeo.data?.description : undefined),
    titleFallback: "Quản trị",
    descriptionFallback: "Quản trị hệ thống",
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

  return (
    <AdminLayoutBridge value={value}>
      <AdminRealtimeSync />
      {children}
    </AdminLayoutBridge>
  )
}
