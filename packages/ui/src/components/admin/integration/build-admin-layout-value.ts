import type { AdminLayoutContextValue, AdminLayoutStaticConfig, AdminPublicSiteSeo } from "../types"
import type { AdminSiteBrandingState } from "./use-admin-site-branding"

function resolveAuthHeroImage(
  branding: AdminSiteBrandingState,
  siteSeo?: { data: AdminPublicSiteSeo | null; isReady: boolean },
): string | null {
  const fromSetting = branding.authHeroImage?.trim()
  if (fromSetting) return fromSetting
  const fromSeo = siteSeo?.data?.ogImage?.trim()
  if (fromSeo) return fromSeo
  return null
}

export function buildAdminLayoutValue(params: {
  user: AdminLayoutContextValue["user"]
  clientReady: boolean
  logout: AdminLayoutContextValue["logout"]
  branding: AdminSiteBrandingState
  siteSeo?: { data: AdminPublicSiteSeo | null; isReady: boolean }
  static: AdminLayoutStaticConfig
}): AdminLayoutContextValue {
  return {
    user: params.user,
    clientReady: params.clientReady,
    logout: params.logout,
    siteName: params.branding.siteName,
    siteDescription: params.branding.siteDescription,
    brandingReady: params.branding.isReady,
    authHeroImage: resolveAuthHeroImage(params.branding, params.siteSeo),
    ...params.static,
  }
}
