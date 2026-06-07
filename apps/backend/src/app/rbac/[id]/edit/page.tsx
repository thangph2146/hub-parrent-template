"use client"

import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useEffect, useMemo } from "react"
import { useRoleForm } from "../../_component/_hooks"
import { RoleFormShell } from "../../_component/_form"
import { useRbacCatalog, useRoleDetail, useUpdateRoleMutation } from "../../_component/_query"
import { useAuth } from "@/providers/auth-provider"
import { AdminFormPageHeader, AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import {
  canUserAccess,
  isSuperAdminRoleCode,
  PERMISSION_CODES,
} from "@workspace/api-client"
import { canEditSuperAdminRole } from "@/config/protected-admin"
import { Card, CardContent } from "@ui/components/card"
import { ShieldAlert } from "lucide-react"

function EditRolePageInner() {
  const params = useParams()
  const crudNav = useAdminCrudNavigation("/rbac");
  const { user: session } = useAuth()
  const roleId = params.id as string

  const canManageRoles =
    session != null && canUserAccess(session, PERMISSION_CODES.USERS_MANAGE)

  const roleQuery = useRoleDetail(roleId)
  const catalogQuery = useRbacCatalog()
  const updateMutation = useUpdateRoleMutation()

  const { form, populateForm, resetForm, getPayload } = useRoleForm()

  const permissions = useMemo(
    () => catalogQuery.data?.permissions ?? [],
    [catalogQuery.data?.permissions]
  )

  const role = roleQuery.data

  useEffect(() => {
    if (role) {
      populateForm(role)
    }
  }, [role, populateForm])

  const handleSubmit = async () => {
    if (!role) return
    const isValid = await form.trigger()
    if (!isValid) return

    const payload = getPayload()
    try {
      await updateMutation.mutateAsync({
        id: roleId,
        data: {
          code: payload.code,
          name: payload.name,
          description: payload.description || null,
          permissionCodes: payload.permissions,
          isActive: payload.isActive,
        },
      })
      crudNav.view(String(roleId))
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = () => {
    resetForm()
    crudNav.view(String(roleId))
  }

  if (!session || !canManageRoles) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa vai trò"
          onBack={() => crudNav.view(String(roleId))}
          formId="role-form"
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Không có quyền truy cập</p>
        </div>
      </AdminPageSection>
    )
  }

  if (roleQuery.isLoading || catalogQuery.isLoading || !role) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa vai trò"
          onBack={() => crudNav.view(String(roleId))}
          formId="role-form"
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AdminPageSection>
    )
  }

  const isSystemSuperAdmin = isSuperAdminRoleCode(role.code)
  const canEditThisRole =
    !isSystemSuperAdmin || canEditSuperAdminRole(session?.email)

  if (!canEditThisRole) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa vai trò"
          onBack={() => crudNav.view(String(roleId))}
          formId="role-form"
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <ShieldAlert className="size-12 text-destructive/70" />
            <div>
              <p className="text-base font-semibold">Vai trò hệ thống</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Chỉ tài khoản trong{" "}
                <span className="font-mono text-xs">NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS</span>{" "}
                mới được chỉnh sửa vai trò Super Admin.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdminPageSection>
    )
  }

  return (
    <AdminPageSection>
      <RoleFormShell
        isEdit={true}
        form={form}
        permissions={permissions}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={updateMutation.isPending}
      />
    </AdminPageSection>
  )
}

export default function EditRolePage() {
  return (
    <AdminPageGuard roles={["super_admin"]}>
      <EditRolePageInner />
    </AdminPageGuard>
  )
}
