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
