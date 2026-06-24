"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { AcademicYearFormShell } from "../_form"
import { useAcademicYearForm, buildAcademicYearPayload } from "../_hooks"
import type { AcademicYearFormValues } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewAcademicYearPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("academic-years")
  const queryClient = useQueryClient()
  const { form } = useAcademicYearForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["academic-years"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo niên khóa "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo niên khóa",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.academicYears.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: AcademicYearFormValues) => {
      await createMutation.mutateAsync(buildAcademicYearPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <AcademicYearFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => crudNav.list()}
        onReset={() => {
          form.reset()
        }}
      />
    </AdminPageSection>
  )
}

export default function NewAcademicYearPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewAcademicYearPageInner />
    </AdminPageGuard>
  )
}
