import { PERMISSION_CODES } from "@workspace/api-client"
"use client"

import { useCallback, useEffect } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import {
  SpeakerFormShell,
  useSpeakerForm,
  useSpeakerDetailQuery,
  buildSpeakerPayload,
} from "../../_component"
import type { SpeakerFormValues } from "../../_component"

import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
import { useAdminFormDraftPersistence } from "@/hooks/admin/use-admin-edit-form-hydration"
function EditSpeakerPageInner() {
  const crudNav = useAdminCrudNavigation("/admin/speakers")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = useSpeakerForm()

  const {
    data: entity,
    isLoading,
    isError,
    refetch,
  } = useSpeakerDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được diễn giả")
      crudNav.list()
    }
  }, [isError, crudNav])

  useHydrateOncePerEntity(id, entity, (entity) => {
    const draft = loadEntityDraft(buildEntityDraftKey("speakers", id))
    if (draft) {
      form.reset(draft)
      return
    }
    form.reset({
      name: entity.name ?? "",
      title: entity.title ?? "",
      organization: entity.organization ?? "",
      bio: entity.bio ?? "",
      avatar: entity.avatar ?? "",
      email: entity.email ?? "",
      phone: entity.phone ?? "",
      status: entity.status ?? 1,
    })
  })

  const { clearDraft } = useAdminFormDraftPersistence("speakers", id, form)

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["speakers"] })
  }

  const updateMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật diễn giả "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật diễn giả",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.speakers.update(id, input),
    onSuccess: async () => {
      clearDraft()
      await invalidateAll()
      crudNav.view(String(id))
    },
  })

  const handleSubmit = useCallback(
    async (values: SpeakerFormValues) => {
      await updateMutation.mutateAsync(buildSpeakerPayload(values))
    },
    [updateMutation]
  )

  if (isLoading) {
    return <AdminPageLoading variant="form" />
  }

  if (!entity) return null

  return (
    <AdminPageSection>
      <SpeakerFormShell
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

export default function EditSpeakerPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.SPEAKERS_UPDATE}>
      <EditSpeakerPageInner />
    </AdminPageGuard>
  )
}
