"use client"

import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useEffect } from "react"
import { useStaffForm, useStaffMutations } from "../../_component"
import { StaffFormShell } from "../../_component/_form"
import { useRbacCatalog, useStaffProfile } from "@/hooks/queries"
import { useAuth } from "@/providers/auth-provider"
import { AdminFormPageHeader, AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { Card, CardContent } from "@ui/components/card"
import { api } from "@/lib/api"
import { ShieldAlert } from "lucide-react"
import { canEditProtectedAdminUser } from "@/config/protected-admin"

function EditStaffPageInner() {
  const params = useParams()
  const crudNav = useAdminCrudNavigation("/staff");
  const { user: session } = useAuth()
  const canManageUsers =
    session != null && canUserAccess(session, PERMISSION_CODES.USERS_MANAGE)
  const { updateMutation } = useStaffMutations({ api })
  const { form, resetForm, populateForm, getPayload } = useStaffForm({
    editingId: params.id as string,
  })

  const userId = params.id as string

  const userQuery = useStaffProfile(userId)
  const rbacQuery = useRbacCatalog({
    enabled: Boolean(session) && canManageUsers,
  })

  const user = userQuery.data
  const roles = rbacQuery.data?.roles ?? []

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      populateForm(user)
    }
  }, [user, populateForm])

  const handleSubmit = async () => {
    if (!user) return
    const isValid = await form.trigger()
    if (!isValid) {
      return
    }

    const payload = getPayload()
    try {
      await updateMutation.mutateAsync({ id: user.id, input: payload })
      crudNav.view(String(userId))
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = () => {
    resetForm()
    crudNav.view(String(userId))
  }

  if (!session || !canManageUsers) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa nhân sự"
          onBack={() => crudNav.view(String(userId))}
          formId="staff-form"
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Không có quyền truy cập</p>
          </CardContent>
        </Card>
      </AdminPageSection>
    )
  }

  if (userQuery.isLoading || !user) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa nhân sự"
          onBack={() => crudNav.view(String(userId))}
          formId="staff-form"
        />
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </AdminPageSection>
    )
  }

  if (!canEditProtectedAdminUser(session?.email, user.email)) {
    return (
      <AdminPageSection>
        <AdminFormPageHeader
          title="Sửa nhân sự"
          onBack={() => crudNav.view(String(userId))}
          formId="staff-form"
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <ShieldAlert className="size-12 text-destructive/70" />
            <div>
              <p className="text-base font-semibold">Tài khoản hệ thống</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tài khoản{" "}
                <span className="font-mono font-medium">{user.email}</span> chỉ được
                chỉnh sửa khi đăng nhập đúng tài khoản đó.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdminPageSection>
    )
  }

  return (
    <AdminPageSection>
      <StaffFormShell
        isEdit={true}
        form={form}
        roles={roles}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={updateMutation.isPending}
      />
    </AdminPageSection>
  )
}

export default function EditStaffPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin"]}>
      <EditStaffPageInner />
    </AdminPageGuard>
  )
}
