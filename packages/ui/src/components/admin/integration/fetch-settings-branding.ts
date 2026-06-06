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
async function safeSettingGet(
  get: (path: string, signal?: AbortSignal) => Promise<unknown>,
  path: string,
  fallback: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    return extractSettingString(await get(path, signal), fallback)
  } catch {
    return fallback
  }
}

export async function fetchAdminSettingsBranding(
  get: (path: string, signal?: AbortSignal) => Promise<unknown>,
  defaults: AdminSiteBranding = {
    siteName: "HUB Parent",
    siteDescription: "Quản trị hệ thống",
  },
  signal?: AbortSignal
): Promise<AdminSiteBranding> {
  const [siteName, siteDescription] = await Promise.all([
    safeSettingGet(get, "/admin/settings/site_name", defaults.siteName, signal),
    safeSettingGet(
      get,
      "/admin/settings/site_description",
      defaults.siteDescription,
      signal
    ),
  ])
  return { siteName, siteDescription }
}
