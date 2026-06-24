"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback, useEffect } from "react"
import { useAdminEditFormHydration } from "@workspace/admin-app/hooks/use-admin-edit-form-hydration"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { DepartmentFormShell } from "../_form"
import { useDepartmentForm, buildDepartmentPayload } from "../_hooks"
import { useDepartmentDetailQuery } from "../_query"
import type { DepartmentDetail, DepartmentFormValues } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"

function departmentToFormValues(
  entity: DepartmentDetail,
): DepartmentFormValues {
  return {
    name: entity.name ?? "",
    code: entity.code ?? "",
    description: entity.description ?? "",
    status: entity.status ?? 1,
  }
}

function EditDepartmentPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("departments")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = useDepartmentForm()

  const { data: entity, isLoading, isError } = useDepartmentDetailQuery(api, id)

  const { clearDraft, resetFromServer } = useAdminEditFormHydration({
    scope: "departments",
    entityId: id,
    data: entity,
    form,
    toFormValues: departmentToFormValues,
  })

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được phòng khoa")
      crudNav.list()
    }
  }, [isError, crudNav])

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["departments"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật phòng khoa "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật phòng khoa",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.departments.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const handleSubmit = useCallback(
    async (values: DepartmentFormValues) => {
      await updateMutation.mutateAsync(buildDepartmentPayload(values))
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading variant="form" />
  }

  if (!entity) return null

  return (
    <AdminPageSection>
      <DepartmentFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={id}
        onBack={() => crudNav.view(String(id))}
        onReset={resetFromServer}
      />
    </AdminPageSection>
  )
}

export default function EditDepartmentPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditDepartmentPageInner />
    </AdminPageGuard>
  )
}
