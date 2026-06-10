"use client"

import type { ReactNode } from "react"
import { canUserAccess, type PermissionCode } from "@workspace/api-client"
import { useAdminLayout } from "./layout-context"
import { AdminAccessDeniedPanel } from "./access-denied-panel"

const BYPASS_ROLES = ["super_admin", "admin"] as const

export function AdminPageGuard({
  permission,
  permissions,
  roles,
  children,
}: {
  permission?: PermissionCode
  /** Một trong các quyền (OR). */
  permissions?: PermissionCode[]
  roles?: string[]
  children: ReactNode
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
        <AdminAccessDeniedPanel user={user} requiredRoles={roles} />
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
        <AdminAccessDeniedPanel user={user} requiredPermission={code} />
      )
    }
  } else if (requiredCodes.length > 1) {
    const hasAny = requiredCodes.some((code) => canUserAccess(user, code))
    if (!hasAny) {
      return (
        <AdminAccessDeniedPanel
          user={user}
          requiredPermissions={requiredCodes}
        />
      )
    }
  }

  return <>{children}</>
}
