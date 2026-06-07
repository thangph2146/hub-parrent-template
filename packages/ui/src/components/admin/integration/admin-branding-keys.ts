/** Khóa `page` SEO mặc định toàn site (tab seo-global). */
export const ADMIN_SITE_SEO_PAGE_KEY = "__site__" as const

/** Query key branding công khai — dùng chung layout admin và trang settings. */
export const ADMIN_PUBLIC_BRANDING_QUERY_KEY = [
  "settings",
  "site-config",
  "public",
] as const

/** Query key SEO mặc định công khai — dùng chung layout admin và tab seo-global. */
export const ADMIN_PUBLIC_SITE_SEO_QUERY_KEY = [
  "seo-metas",
  "public",
  ADMIN_SITE_SEO_PAGE_KEY,
] as const
