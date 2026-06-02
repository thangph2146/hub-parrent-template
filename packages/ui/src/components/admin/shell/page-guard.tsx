"use client"

import type { ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "../../card"
import { canUserAccess, type PermissionCode } from "@workspace/api-client"
import { useAdminLayout } from "./layout-context"

const BYPASS_ROLES = ["super_admin", "admin"] as const

export function AdminPageGuard({
  permission,
  roles,
  children,
}: {
  permission?: PermissionCode
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
    if (!hasRole) return <AccessDenied />
  }

  if (permission) {
    if (!canUserAccess(user, permission)) return <AccessDenied />
  }

  return <>{children}</>
}

function AccessDenied() {
  return (
    <div className="p-6">
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <CardTitle className="text-base">Không có quyền truy cập</CardTitle>
            <CardDescription className="mt-1">
              Tài khoản của bạn không có quyền xem trang này.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
