/** Khóa `page` trong bảng `seo_meta` cho SEO mặc định toàn site (storefront). */
export const SITE_SEO_PAGE_KEY = "__site__"

export type SettingsTabId = "display" | "seo-global"

export const SETTINGS_TAB_LABELS: Record<SettingsTabId, string> = {
  display: "Hiển thị & hệ thống",
  "seo-global": "SEO mặc định",
}
