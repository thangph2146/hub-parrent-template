"use client"

import { useEffect, useMemo, type ReactNode } from "react"
import {
  ADMIN_PUBLIC_BRANDING_QUERY_KEY,
  ADMIN_PUBLIC_SITE_SEO_QUERY_KEY,
  ADMIN_SITE_SEO_PAGE_KEY,
  AdminLayoutBridge,
  buildAdminLayoutValue,
  useAdminDocumentHeadOverride,
  useAdminDocumentTitle,
  useAdminSiteBranding,
  useAdminPublicSiteSeo,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import { STORE_ADMIN_LAYOUT_STATIC } from "@/config/admin/store-admin-layout-static"
import { AdminRealtimeSync } from "@/providers/admin/admin-realtime-sync"
import { useAuth, useClientReady } from "@/providers/admin/auth-provider"
import { syncAdminSessionIfCurrentUser } from "@/lib/admin/auth-session"

export function StoreAdminLayoutProvider({
  children,
}: {
  children: ReactNode
}) {
  const clientReady = useClientReady()
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!clientReady || user?.id == null) return
    void syncAdminSessionIfCurrentUser(user.id)
  }, [clientReady, user?.id])

  const branding = useAdminSiteBranding({
    queryKey: ADMIN_PUBLIC_BRANDING_QUERY_KEY,
    fetchBranding: ({ signal }) => api.settings.getPublicBranding({ signal }),
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
    titleFallback: "Quản trị StoreSync",
    descriptionFallback: "Quản lý sản phẩm, đơn hàng và cửa hàng B2B",
  })

  const value = useMemo(
    () =>
      buildAdminLayoutValue({
        user: user ?? null,
        clientReady,
        logout,
        branding,
        static: STORE_ADMIN_LAYOUT_STATIC,
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
