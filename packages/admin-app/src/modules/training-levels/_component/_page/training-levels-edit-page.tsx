"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback, useEffect } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { TrainingLevelFormShell } from "../_form"
import { useTrainingLevelForm, buildTrainingLevelPayload } from "../_hooks"
import { useTrainingLevelDetailQuery } from "../_query"
import type { TrainingLevelFormValues } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useAdminFormDraftPersistence } from "@workspace/admin-app/hooks/use-admin-edit-form-hydration"
function EditTrainingLevelPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("training-levels")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = useTrainingLevelForm()

  const {
    data: entity,
    isLoading,
    isError,
    refetch,
  } = useTrainingLevelDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được bậc học")
      crudNav.list()
    }
  }, [isError, crudNav])

  useHydrateOncePerEntity(id, entity, (entity) => {
    const draft = loadEntityDraft(buildEntityDraftKey("training-levels", id))
    if (draft) {
      form.reset(draft)
      return
    }
    form.reset({
      name: entity.name ?? "",
      code: entity.code ?? "",
      status: entity.status ?? 1,
    })
  })

  const { clearDraft } = useAdminFormDraftPersistence("training-levels", id, form)

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-levels"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật bậc học "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật bậc học",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.trainingLevels.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const handleSubmit = useCallback(
    async (values: TrainingLevelFormValues) => {
      await updateMutation.mutateAsync(buildTrainingLevelPayload(values))
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading variant="form" />
  }

  if (!entity) return null

  return (
    <AdminPageSection>
      <TrainingLevelFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={id}
        onBack={() => crudNav.view(String(id))}
        onReset={async () => {
          await refetch()
        }}
      />
    </AdminPageSection>
  )
}

export default function EditTrainingLevelPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditTrainingLevelPageInner />
    </AdminPageGuard>
  )
}
