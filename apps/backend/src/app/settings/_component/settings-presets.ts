/** Ảnh OG mặc định storefront — khớp `apps/frontend/src/lib/seo.ts`. */
export const DEFAULT_STOREFRONT_OG_IMAGE =
  "https://fileserver2.hub.edu.vn/IMAGES/2025/12/16/20251216103027-101020.png"

export type SettingsDisplayPreset = {
  id: string
  label: string
  hint: string
  siteName: string
  siteDescription: string
  defaultNewUserRole: string
}

export type SettingsSeoGlobalPreset = {
  id: string
  label: string
  hint: string
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  ogImage: string
}

/** Mẫu thương hiệu admin + role mặc định theo từng composition PM2. */
export const SETTINGS_DISPLAY_PRESETS: SettingsDisplayPreset[] = [
  {
    id: "hub-parent",
    label: "HUB Parent",
    hint: "Site chính — phụ huynh, nhà trường (ecosystem.main)",
    siteName: "HUB Parent",
    siteDescription: "Quản trị hệ thống kết nối phụ huynh và nhà trường",
    defaultNewUserRole: "parent",
  },
  {
    id: "hub-checkin",
    label: "HUB Check-in",
    hint: "Stack check-in sự kiện (ecosystem.checkin)",
    siteName: "Hệ thống Sự kiện HUB",
    siteDescription: "Quản trị đăng ký và check-in sự kiện",
    defaultNewUserRole: "student",
  },
  {
    id: "hub-minimal",
    label: "Tối giản",
    hint: "Tên ngắn cho môi trường dev / demo nội bộ",
    siteName: "HUB Admin",
    siteDescription: "Quản trị hệ thống",
    defaultNewUserRole: "parent",
  },
]

/** Mẫu SEO mặc định toàn site (`page = __site__`). */
export const SETTINGS_SEO_GLOBAL_PRESETS: SettingsSeoGlobalPreset[] = [
  {
    id: "hub-parent",
    label: "HUB Parent",
    hint: "Khớp metadata storefront site chính",
    title: "HUB Parent - Kết nối phụ huynh và nhà trường",
    description:
      "HUB Parent là hệ thống kết nối phụ huynh với Trường Đại học Ngân hàng TP.HCM, hỗ trợ theo dõi thông tin học tập, gửi liên hệ và cập nhật thông báo từ nhà trường.",
    keywords: "hub parent, phụ huynh, nhà trường, đại học ngân hàng",
    ogTitle: "HUB Parent - Kết nối phụ huynh và nhà trường",
    ogDescription:
      "Theo dõi thông tin học tập, liên hệ và thông báo từ nhà trường trên một nền tảng thống nhất.",
    ogImage: DEFAULT_STOREFRONT_OG_IMAGE,
  },
  {
    id: "hub-checkin",
    label: "HUB Check-in",
    hint: "SEO cho cổng đăng ký / check-in sự kiện",
    title: "Hệ thống Sự kiện HUB - Đăng ký và check-in",
    description:
      "Đăng ký tham dự sự kiện, nhận mã QR và check-in/check-out nhanh tại Trường Đại học Ngân hàng TP.HCM.",
    keywords: "hub sự kiện, check-in, đăng ký sự kiện, qr check-in",
    ogTitle: "Hệ thống Sự kiện HUB",
    ogDescription:
      "Đăng ký sự kiện, quản lý tham dự và check-in trực tuyến.",
    ogImage: DEFAULT_STOREFRONT_OG_IMAGE,
  },
]

export function getSettingsDisplayPreset(
  id: string,
): SettingsDisplayPreset | undefined {
  return SETTINGS_DISPLAY_PRESETS.find((preset) => preset.id === id)
}

export function getSettingsSeoGlobalPreset(
  id: string,
): SettingsSeoGlobalPreset | undefined {
  return SETTINGS_SEO_GLOBAL_PRESETS.find((preset) => preset.id === id)
}
