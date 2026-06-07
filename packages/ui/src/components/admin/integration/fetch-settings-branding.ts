import type { AdminPublicSiteSeo, AdminSiteBranding } from "../types"
import { ADMIN_BRANDING_FALLBACK } from "./admin-branding-fallbacks"

function unwrapApiPayload<T extends Record<string, unknown>>(res: unknown): T {
  if (res == null || typeof res !== "object") return {} as T
  const envelope = res as {
    success?: boolean
    data?: T
  } & T
  if (
    envelope.success === true &&
    envelope.data != null &&
    typeof envelope.data === "object"
  ) {
    return envelope.data
  }
  if (envelope.data != null && typeof envelope.data === "object") {
    return envelope.data
  }
  return envelope as T
}

function extractPublicBranding(
  res: unknown,
  defaults: AdminSiteBranding = ADMIN_BRANDING_FALLBACK
): AdminSiteBranding {
  const payload = unwrapApiPayload<Partial<AdminSiteBranding>>(res)

  return {
    siteName:
      typeof payload.siteName === "string"
        ? payload.siteName
        : defaults.siteName,
    siteDescription:
      typeof payload.siteDescription === "string"
        ? payload.siteDescription
        : defaults.siteDescription,
  }
}

/**
 * Đọc site_name + site_description từ API public (không cần đăng nhập).
 */
export async function fetchPublicAdminSettingsBranding(
  get: (path: string, signal?: AbortSignal) => Promise<unknown>,
  defaults: AdminSiteBranding = ADMIN_BRANDING_FALLBACK,
  signal?: AbortSignal
): Promise<AdminSiteBranding> {
  try {
    return extractPublicBranding(
      await get("/public/site-branding", signal),
      defaults
    )
  } catch {
    return defaults
  }
}

/**
 * Alias giữ tương thích — luôn dùng endpoint public.
 */
export async function fetchAdminSettingsBranding(
  get: (path: string, signal?: AbortSignal) => Promise<unknown>,
  defaults: AdminSiteBranding = ADMIN_BRANDING_FALLBACK,
  signal?: AbortSignal
): Promise<AdminSiteBranding> {
  return fetchPublicAdminSettingsBranding(get, defaults, signal)
}

function extractPublicSiteSeo(res: unknown, page: string): AdminPublicSiteSeo | null {
  if (res == null) return null

  const payload = unwrapApiPayload<Partial<AdminPublicSiteSeo>>(res)

  if (typeof payload.page !== "string") {
    return {
      page,
      title: null,
      description: null,
      keywords: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
    }
  }

  const asString = (value: unknown) =>
    typeof value === "string" ? value : value == null ? null : String(value)

  return {
    page: payload.page,
    title: asString(payload.title),
    description: asString(payload.description),
    keywords: asString(payload.keywords),
    ogTitle: asString(payload.ogTitle),
    ogDescription: asString(payload.ogDescription),
    ogImage: asString(payload.ogImage),
  }
}

/** Đọc SEO mặc định từ API public (tab seo-global). Trả `null` khi chưa cấu hình (404). */
export async function fetchPublicSiteSeo(
  get: (path: string, signal?: AbortSignal) => Promise<unknown>,
  page: string,
  signal?: AbortSignal
): Promise<AdminPublicSiteSeo | null> {
  try {
    return extractPublicSiteSeo(
      await get(`/public/seo-meta?page=${encodeURIComponent(page)}`, signal),
      page
    )
  } catch {
    return null
  }
}
