"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import {
  SpeakerFormShell,
  useSpeakerForm,
  buildSpeakerPayload,
} from "../_component"
import type { SpeakerFormValues } from "../_component"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewSpeakerPageInner() {
  const crudNav = useAdminModuleNavigation("speakers")
  const queryClient = useQueryClient()
  const { form } = useSpeakerForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["speakers"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo diễn giả "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo diễn giả",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.speakers.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: SpeakerFormValues) => {
      await createMutation.mutateAsync(buildSpeakerPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <SpeakerFormShell
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

export default function NewSpeakerPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewSpeakerPageInner />
    </AdminPageGuard>
  )
}
