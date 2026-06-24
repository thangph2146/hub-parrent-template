"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { MajorsFormShell } from "../_form"
import { useMajorForm, buildMajorPayload } from "../_hooks"
import type { MajorFormValues } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewMajorPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("majors")
  const queryClient = useQueryClient()
  const { form } = useMajorForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["majors"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo ngành học "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo ngành học",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.majors.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: MajorFormValues) => {
      await createMutation.mutateAsync(buildMajorPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <MajorsFormShell
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

export default function NewMajorPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewMajorPageInner />
    </AdminPageGuard>
  )
}
