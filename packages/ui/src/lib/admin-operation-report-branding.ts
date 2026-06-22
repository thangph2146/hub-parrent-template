import { ADMIN_BRANDING_FALLBACK } from "../components/admin/integration/admin-branding-fallbacks"
import { buildAdminDocumentHead } from "../components/admin/integration/use-admin-document-title"

export type AdminOperationReportBrandingInput = {
  siteName?: string
  siteDescription?: string
  metaTitle?: string | null
  metaDescription?: string | null
  titleFallback?: string
  descriptionFallback?: string
}

export type AdminOperationReportBrandingSource =
  | "seo-global.title"
  | "display.site_name"
  | "fallback"
  | "seo-global.description"
  | "display.site_description"

export type AdminOperationReportBranding = {
  siteName: string
  siteDescription: string
  documentTitle: string
  documentDescription: string
  titleSource: AdminOperationReportBrandingSource
  descriptionSource: AdminOperationReportBrandingSource
}

let brandingSnapshot: AdminOperationReportBrandingInput | null = null

/** Đồng bộ từ layout admin sau khi fetch Cài đặt hệ thống (display + seo-global). */
export function syncAdminOperationReportBranding(
  input: AdminOperationReportBrandingInput,
): void {
  brandingSnapshot = input
}

export function resolveAdminOperationReportBranding(
  overrides?: AdminOperationReportBrandingInput,
): AdminOperationReportBranding {
  const merged: AdminOperationReportBrandingInput = {
    ...brandingSnapshot,
    ...overrides,
  }

  const siteName =
    merged.siteName?.trim() || ADMIN_BRANDING_FALLBACK.siteName
  const siteDescription =
    merged.siteDescription?.trim() || ADMIN_BRANDING_FALLBACK.siteDescription
  const seoTitle = merged.metaTitle?.trim() ?? ""
  const seoDescription = merged.metaDescription?.trim() ?? ""
  const titleFallback = merged.titleFallback ?? "Quản trị HUB"
  const descriptionFallback =
    merged.descriptionFallback ?? ADMIN_BRANDING_FALLBACK.siteDescription

  const head = buildAdminDocumentHead({
    siteName,
    siteDescription,
    metaTitle: seoTitle || undefined,
    metaDescription: seoDescription || undefined,
    titleFallback,
    descriptionFallback,
  })

  const titleSource: AdminOperationReportBrandingSource = seoTitle
    ? "seo-global.title"
    : merged.siteName?.trim()
      ? "display.site_name"
      : "fallback"

  const descriptionSource: AdminOperationReportBrandingSource = seoDescription
    ? "seo-global.description"
    : merged.siteDescription?.trim()
      ? "display.site_description"
      : "fallback"

  return {
    siteName,
    siteDescription,
    documentTitle: head.title,
    documentDescription: head.description,
    titleSource,
    descriptionSource,
  }
}

/** Header báo cáo copy toast thao tác admin — lấy tên cổng từ Cài đặt hệ thống. */
export function resolveAdminOperationReportHeader(): string {
  const { siteName } = resolveAdminOperationReportBranding()
  return `BÁO CÁO THAO TÁC — ${siteName}`
}

export function formatAdminOperationReportBrandingSection(): string[] {
  const branding = resolveAdminOperationReportBranding()
  return [
    "",
    "── Cài đặt hệ thống (Thương hiệu admin & SEO mặc định) ──",
    `Tên cổng (display.site_name): ${branding.siteName}`,
    `Mô tả (display.site_description): ${branding.siteDescription}`,
    `Tiêu đề hiển thị: ${branding.documentTitle}`,
    `Nguồn tiêu đề: ${branding.titleSource}`,
    `Meta description: ${branding.documentDescription}`,
    `Nguồn mô tả: ${branding.descriptionSource}`,
  ]
}

/** Nhãn cổng admin — dùng cho copy session / dev login. */
export function resolveAdminPortalLabel(fallback?: string): string {
  const { siteName } = resolveAdminOperationReportBranding()
  return siteName || fallback?.trim() || ADMIN_BRANDING_FALLBACK.siteName
}
