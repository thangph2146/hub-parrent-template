"use client"

import type { ReactNode } from "react"
import { canUserAccess, type PermissionCode } from "@workspace/api-client"
import { useAdminLayout } from "./layout-context"
import { AdminAccessDeniedPanel } from "./access-denied-panel"

const BYPASS_ROLES = ["super_admin", "admin"] as const

export function AdminActionGuard({
  permission,
  permissions,
  roles,
  actionLabel,
  children,
  fallback = null,
}: {
  permission?: PermissionCode
  permissions?: PermissionCode[]
  roles?: string[]
  /** Mô tả thao tác (vd. "Cập nhật hồ sơ tài khoản"). */
  actionLabel?: string
  children: ReactNode
  /** Nội dung khi thiếu quyền và không hiện panel chi tiết (prod). */
  fallback?: ReactNode
}) {
  const { user } = useAdminLayout()

  if (!user) return null

  const isBypassRole =
    user.roles?.some((r) =>
      BYPASS_ROLES.includes(r.name as (typeof BYPASS_ROLES)[number]),
    ) ?? false
  if (isBypassRole) return <>{children}</>

  if (roles?.length) {
    const hasRole = user.roles?.some((r) => roles.includes(r.name)) ?? false
    if (!hasRole) {
      return (
        <AdminAccessDeniedPanel
          user={user}
          scope="action"
          actionLabel={actionLabel}
          compact
          requiredRoles={roles}
          fallback={fallback}
        />
      )
    }
  }

  const requiredCodes = [
    ...(permission ? [permission] : []),
    ...(permissions ?? []),
  ].filter((code, index, arr) => arr.indexOf(code) === index)

  if (requiredCodes.length === 1) {
    const code = requiredCodes[0]!
    if (!canUserAccess(user, code)) {
      return (
        <AdminAccessDeniedPanel
          user={user}
          scope="action"
          actionLabel={actionLabel}
          compact
          requiredPermission={code}
          fallback={fallback}
        />
      )
    }
  } else if (requiredCodes.length > 1) {
    const hasAny = requiredCodes.some((code) => canUserAccess(user, code))
    if (!hasAny) {
      return (
        <AdminAccessDeniedPanel
          user={user}
          scope="action"
          actionLabel={actionLabel}
          compact
          requiredPermissions={requiredCodes}
          fallback={fallback}
        />
      )
    }
  }

  return <>{children}</>
}
