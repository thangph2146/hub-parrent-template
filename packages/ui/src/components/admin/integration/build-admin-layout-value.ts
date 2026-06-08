import type { AdminLayoutContextValue, AdminLayoutStaticConfig } from "../types"
import type { AdminSiteBrandingState } from "./use-admin-site-branding"

export function buildAdminLayoutValue(params: {
  user: AdminLayoutContextValue["user"]
  clientReady: boolean
  logout: AdminLayoutContextValue["logout"]
  branding: AdminSiteBrandingState
  static: AdminLayoutStaticConfig
}): AdminLayoutContextValue {
  return {
    user: params.user,
    clientReady: params.clientReady,
    logout: params.logout,
    siteName: params.branding.siteName,
    siteDescription: params.branding.siteDescription,
    brandingReady: params.branding.isReady,
    ...params.static,
  }
}
