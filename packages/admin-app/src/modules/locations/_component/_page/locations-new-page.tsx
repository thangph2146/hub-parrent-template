"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { LocationFormShell } from "../_form"
import { useLocationForm, buildLocationPayload } from "../_hooks"
import type { LocationFormValues } from "../shared/types"

import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewLocationPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("locations")
  const queryClient = useQueryClient()
  const { form } = useLocationForm()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["locations"] })
  }

  const createMutation = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo địa điểm "${(variables.name as string)?.trim() || (variables.mapUrl as string)?.trim()}"`,
      error: (err) =>
        err instanceof Error ? err.message : "Không thể tạo địa điểm",
    },
    mutationFn: async (input: Record<string, unknown>) =>
      api.locations.create(input),
    onSuccess: async () => {
      await invalidateAll()
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: LocationFormValues) => {
      await createMutation.mutateAsync(buildLocationPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <LocationFormShell
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

export default function NewLocationPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewLocationPageInner />
    </AdminPageGuard>
  )
}
