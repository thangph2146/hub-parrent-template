"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { TagFormShell, useTagForm, buildTagPayload } from "../_component"
import type { TagFormValues } from "../_component"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewTagPageInner() {
  const crudNav = useAdminModuleNavigation("tags")
  const queryClient = useQueryClient()
  const { form } = useTagForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["media", "tags"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo thẻ "${(variables.name as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo thẻ",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.tags.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: TagFormValues) => {
      await createMutation.mutateAsync(buildTagPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <TagFormShell
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

export default function NewTagPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewTagPageInner />
    </AdminPageGuard>
  )
}
