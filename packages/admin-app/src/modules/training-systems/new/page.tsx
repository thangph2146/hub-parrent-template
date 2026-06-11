"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import {
  TrainingSystemFormShell,
  useTrainingSystemForm,
  buildTrainingSystemPayload,
} from "../_component"
import type { TrainingSystemFormValues } from "../_component"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewTrainingSystemPageInner() {
  const crudNav = useAdminModuleNavigation("training-systems")
  const queryClient = useQueryClient()
  const { form } = useTrainingSystemForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-systems"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo hệ đào tạo "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo hệ đào tạo",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingSystems.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: TrainingSystemFormValues) => {
      await createMutation.mutateAsync(buildTrainingSystemPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <TrainingSystemFormShell
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

export default function NewTrainingSystemPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewTrainingSystemPageInner />
    </AdminPageGuard>
  )
}
