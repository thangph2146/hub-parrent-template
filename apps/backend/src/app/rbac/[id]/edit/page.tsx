"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { useRoleForm } from "../../_component/_hooks"
import { RoleFormShell } from "../../_component/_form"
import { useRbacCatalog, useRoleDetail, useUpdateRoleMutation } from "../../_component/_query"
import { useAuth } from "@/providers/auth-provider"
import { AdminFormPageHeader, AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

function EditRolePageInner() {
  const params = useParams()
  const router = useRouter()
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
      router.push(`/rbac/${roleId}`)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = () => {
    resetForm()
    router.push(`/rbac/${roleId}`)
  }

  if (!session || !canManageRoles) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa vai trò"
          onBack={() => router.push(`/rbac/${roleId}`)}
          formId="role-form"
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Không có quyền truy cập</p>
        </div>
      </AdminPageSection>
    )
  }

  if (roleQuery.isLoading || !role) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa vai trò"
          onBack={() => router.push(`/rbac/${roleId}`)}
          formId="role-form"
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
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
