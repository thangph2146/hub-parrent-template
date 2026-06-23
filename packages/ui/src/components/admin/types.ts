import type { LucideIcon } from "lucide-react"
import type { AuthUser, PermissionCode } from "@workspace/api-client"

/** User trong layout admin — cùng shape với phiên API. */
export type AdminLayoutUser = AuthUser

export type AdminMenuLeaf = {
  href: string
  label: string
  icon: LucideIcon
  permission: PermissionCode | null
  anyPermission?: PermissionCode[]
  roleGuard?: string
  adminOnly?: boolean
}

export type AdminMenuTreeItem =
  | ({ type: "leaf" } & AdminMenuLeaf)
  | {
      type: "group"
      label: string
      icon: LucideIcon
      children: AdminMenuLeaf[]
    }

export type AdminSiteBranding = {
  siteName: string
  siteDescription: string
  /** Ảnh panel đăng nhập admin — setting `admin_login_hero_image`. */
  authHeroImage?: string | null
}

/** SEO mặc định toàn site — tab seo-global / GET /api/public/seo-meta. */
export type AdminPublicSiteSeo = {
  page: string
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
}

/** Context value do app admin cung cấp qua `AdminLayoutBridge`. */
export type AdminLayoutContextValue = {
  user: AdminLayoutUser | null
  clientReady: boolean
  logout: () => void | Promise<void>
  menuTree: AdminMenuTreeItem[]
  siteName: string
  siteDescription: string
  /** Branding từ tab display đã fetch — tránh flash tên fallback trên màn loading. */
  brandingReady: boolean
  /** Ảnh hero trang đăng nhập — `admin_login_hero_image` hoặc SEO ogImage. */
  authHeroImage: string | null
  loginPath: string
  registerPath: string
  isAuthPath: (pathname: string) => boolean
  canAccessApp: (user: AdminLayoutUser) => boolean
  clearSession: () => void
  sessionEventName: string
  mobileHeaderTitle?: string
  fullWidthPaths?: string[]
  /** Sau đăng nhập trên trang auth — mặc định `/`. */
  homePath?: string
  /** Liên kết hồ sơ trong shell — mặc định `/profile`. */
  profilePath?: string
  /** Liên kết site công khai trong menu tài khoản (vd. trang chủ sự kiện). */
  publicSitePath?: string
  /** Nhãn `publicSitePath` — mặc định "Trang chủ". */
  publicSiteLabel?: string
  /** Query `reason` khi từ chối quyền — mặc định `staff_only`. */
  accessDeniedReason?: string
  /** Module admin bật theo `admin.app.config.json` — dùng dev copy session. */
  enabledAdminModules?: string[]
  /** Resource permission của product line — lọc báo cáo copy session. */
  activePermissionResources?: readonly string[]
}

/** Cấu hình cố định mỗi app admin (menu, auth routes, …). */
export type AdminLayoutStaticConfig = Omit<
  AdminLayoutContextValue,
  | "user"
  | "clientReady"
  | "logout"
  | "siteName"
  | "siteDescription"
  | "brandingReady"
  | "authHeroImage"
>
