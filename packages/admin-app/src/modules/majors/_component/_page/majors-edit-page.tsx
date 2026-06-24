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
import { MajorsFormShell } from "../_form"
import { useMajorForm, buildMajorPayload } from "../_hooks"
import { useMajorDetailQuery } from "../_query"
import type { MajorFormValues } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useAdminFormDraftPersistence } from "@workspace/admin-app/hooks/use-admin-edit-form-hydration"
function EditMajorPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("majors")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = useMajorForm()

  const {
    data: entity,
    isLoading,
    isError,
    refetch,
  } = useMajorDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được ngành học")
      crudNav.list()
    }
  }, [isError, crudNav])

  useHydrateOncePerEntity(id, entity, (entity) => {
    const draft = loadEntityDraft(buildEntityDraftKey("majors", id))
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

  const { clearDraft } = useAdminFormDraftPersistence("majors", id, form)

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["majors"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật ngành học "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật ngành học",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.majors.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const handleSubmit = useCallback(
    async (values: MajorFormValues) => {
      await updateMutation.mutateAsync(buildMajorPayload(values))
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading variant="form" />
  }

  if (!entity) return null

  return (
    <AdminPageSection>
      <MajorsFormShell
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

export default function EditMajorPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditMajorPageInner />
    </AdminPageGuard>
  )
}
