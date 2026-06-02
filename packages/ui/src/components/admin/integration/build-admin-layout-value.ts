import type {
  AdminLayoutContextValue,
  AdminLayoutStaticConfig,
  AdminSiteBranding,
} from "../types"

export function buildAdminLayoutValue(params: {
  user: AdminLayoutContextValue["user"]
  clientReady: boolean
  logout: AdminLayoutContextValue["logout"]
  branding: AdminSiteBranding
  static: AdminLayoutStaticConfig
}): AdminLayoutContextValue {
  return {
    user: params.user,
    clientReady: params.clientReady,
    logout: params.logout,
    siteName: params.branding.siteName,
    siteDescription: params.branding.siteDescription,
    ...params.static,
  }
}
