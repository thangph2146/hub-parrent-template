/** Ảnh OG mặc định — dùng chung storefront, admin SEO preset, API public. */
export const DEFAULT_OG_IMAGE_URL =
  "https://fileserver2.hub.edu.vn/IMAGES/2025/12/16/20251216103027-101020.png"

/** @deprecated Dùng `DEFAULT_OG_IMAGE_URL`. */
export const DEFAULT_STOREFRONT_OG_IMAGE = DEFAULT_OG_IMAGE_URL

export type HubDisplayPreset = {
  id: string
  label: string
  hint: string
  siteName: string
  siteDescription: string
  defaultNewUserRole: string
}

export type HubSeoGlobalPreset = {
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

/** Mẫu thương hiệu admin theo composition PM2 (hub-parent / hub-checkin). */
export const HUB_DISPLAY_PRESETS: HubDisplayPreset[] = [
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
    id: "hub-store",
    label: "HUB Store",
    hint: "Stack storefront B2B / store-sync (ecosystem.store)",
    siteName: "HUB Store",
    siteDescription: "Quản trị cửa hàng, sản phẩm và đơn hàng",
    defaultNewUserRole: "customer",
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
export const HUB_SEO_GLOBAL_PRESETS: HubSeoGlobalPreset[] = [
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
    ogImage: DEFAULT_OG_IMAGE_URL,
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
    ogDescription: "Đăng ký sự kiện, quản lý tham dự và check-in trực tuyến.",
    ogImage: DEFAULT_OG_IMAGE_URL,
  },
  {
    id: "hub-store",
    label: "HUB Store",
    hint: "SEO cho storefront bán hàng / đặt hàng",
    title: "HUB Store - Cửa hàng và đặt hàng trực tuyến",
    description:
      "HUB Store là nền tảng storefront của Trường Đại học Ngân hàng TP.HCM, hỗ trợ xem sản phẩm, đặt hàng và theo dõi đơn trực tuyến.",
    keywords: "hub store, storefront, sản phẩm, đặt hàng, đại học ngân hàng",
    ogTitle: "HUB Store - Cửa hàng trực tuyến",
    ogDescription:
      "Khám phá sản phẩm, đặt hàng nhanh và theo dõi đơn hàng trên HUB Store.",
    ogImage: DEFAULT_OG_IMAGE_URL,
  },
]

export function getHubDisplayPreset(id: string): HubDisplayPreset | undefined {
  return HUB_DISPLAY_PRESETS.find((preset) => preset.id === id)
}

export function getHubSeoGlobalPreset(id: string): HubSeoGlobalPreset | undefined {
  return HUB_SEO_GLOBAL_PRESETS.find((preset) => preset.id === id)
}

/** Alias tương thích admin settings. */
export const SETTINGS_DISPLAY_PRESETS = HUB_DISPLAY_PRESETS
export const SETTINGS_SEO_GLOBAL_PRESETS = HUB_SEO_GLOBAL_PRESETS
export type SettingsDisplayPreset = HubDisplayPreset
export type SettingsSeoGlobalPreset = HubSeoGlobalPreset
export const getSettingsDisplayPreset = getHubDisplayPreset
export const getSettingsSeoGlobalPreset = getHubSeoGlobalPreset
