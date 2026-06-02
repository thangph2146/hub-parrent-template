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
}

/** Context value do app admin cung cấp qua `AdminLayoutBridge`. */
export type AdminLayoutContextValue = {
  user: AdminLayoutUser | null
  clientReady: boolean
  logout: () => void | Promise<void>
  menuTree: AdminMenuTreeItem[]
  siteName: string
  siteDescription: string
  loginPath: string
  isAuthPath: (pathname: string) => boolean
  canAccessApp: (user: AdminLayoutUser) => boolean
  clearSession: () => void
  sessionEventName: string
  mobileHeaderTitle?: string
  fullWidthPaths?: string[]
}

/** Cấu hình cố định mỗi app admin (menu, auth routes, …). */
export type AdminLayoutStaticConfig = Omit<
  AdminLayoutContextValue,
  "user" | "clientReady" | "logout" | "siteName" | "siteDescription"
>
