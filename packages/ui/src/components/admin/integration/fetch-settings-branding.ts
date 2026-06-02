import type { AdminSiteBranding } from "../types"

function extractSettingString(res: unknown, fallback: string): string {
  const envelope = res as { data?: { value?: unknown }; value?: unknown }
  const raw = envelope.data?.value ?? envelope.value
  if (typeof raw !== "string") return fallback
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === "string" ? parsed : raw
  } catch {
    return raw
  }
}

/**
 * Đọc site_name + site_description từ API admin settings.
 * App truyền `http.get` (vd. api.http.get) — không import client app khác.
 */
export async function fetchAdminSettingsBranding(
  get: (path: string) => Promise<unknown>,
  defaults: AdminSiteBranding = {
    siteName: "HUB Parent",
    siteDescription: "Quản trị hệ thống",
  },
): Promise<AdminSiteBranding> {
  const [nameRes, descRes] = await Promise.all([
    get("/admin/settings/site_name"),
    get("/admin/settings/site_description"),
  ])
  return {
    siteName: extractSettingString(nameRes, defaults.siteName),
    siteDescription: extractSettingString(descRes, defaults.siteDescription),
  }
}
