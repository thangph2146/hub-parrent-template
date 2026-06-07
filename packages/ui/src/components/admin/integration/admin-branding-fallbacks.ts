import type { AdminSiteBranding } from "../types"

/** Fallback trung tính — khớp API `PUBLIC_BRANDING_DEFAULTS`, không gắn composition PM2. */
export const ADMIN_BRANDING_FALLBACK: AdminSiteBranding = {
  siteName: "HUB",
  siteDescription: "Quản trị hệ thống",
}
