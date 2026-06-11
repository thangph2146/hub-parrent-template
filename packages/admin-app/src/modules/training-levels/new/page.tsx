"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import {
  TrainingLevelFormShell,
  useTrainingLevelForm,
  buildTrainingLevelPayload,
} from "../_component"
import type { TrainingLevelFormValues } from "../_component"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewTrainingLevelPageInner() {
  const crudNav = useAdminModuleNavigation("training-levels")
  const queryClient = useQueryClient()
  const { form } = useTrainingLevelForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-levels"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo bậc học "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo bậc học",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingLevels.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: TrainingLevelFormValues) => {
      await createMutation.mutateAsync(buildTrainingLevelPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <TrainingLevelFormShell
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

export default function NewTrainingLevelPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewTrainingLevelPageInner />
    </AdminPageGuard>
  )
}
