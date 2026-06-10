"use client"

import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { useMemo } from "react"
import { useAdminEditFormHydration } from "@/hooks/admin/use-admin-edit-form-hydration"
import { useRoleForm } from "../../_component/_hooks"
import { RoleFormShell } from "../../_component/_form"
import {
  useRbacCatalog,
  useRoleDetail,
  useUpdateRoleMutation,
} from "../../_component/_query"
import { useAuth } from "@/providers/admin/auth-provider"
import {
  AdminFormPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import {
  canUserAccess,
  isSuperAdminRoleCode,
  PERMISSION_CODES,
} from "@workspace/api-client"
import { canEditSuperAdminRole } from "@/config/admin/protected-admin"
import { Card, CardContent } from "@ui/components/card"
import { ShieldAlert } from "lucide-react"

function EditRolePageInner() {
  const params = useParams()
  const crudNav = useAdminCrudNavigation("/admin/rbac")
  const { user: session } = useAuth()
  const roleId = params.id as string

  const canManageRoles =
    session != null && canUserAccess(session, PERMISSION_CODES.USERS_MANAGE)

  const roleQuery = useRoleDetail(roleId)
  const catalogQuery = useRbacCatalog()
  const updateMutation = useUpdateRoleMutation()

  const { form, resetForm, getPayload } = useRoleForm()

  const permissions = useMemo(
    () => catalogQuery.data?.permissions ?? [],
    [catalogQuery.data?.permissions]
  )

  const role = roleQuery.data

  const { clearDraft } = useAdminEditFormHydration({
    scope: "rbac",
    entityId: roleId,
    data: role,
    form,
    toFormValues: (item) => ({
      code: item.code,
      name: item.name,
      description: item.description ?? "",
      isActive: item.isActive,
      permissions: item.permissions,
    }),
  })

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
      clearDraft()
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
                <span className="font-mono text-xs">
                  NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS
                </span>{" "}
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
    <AdminPageGuard permission={PERMISSION_CODES.ROLES_UPDATE}>
      <EditRolePageInner />
    </AdminPageGuard>
  )
}
