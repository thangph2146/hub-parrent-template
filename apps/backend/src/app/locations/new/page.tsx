"use client"

import { useAdminCrudNavigation } from "@/lib/admin-navigation"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { api } from "@/lib/api"
import {
  LocationFormShell,
  useLocationForm,
  buildLocationPayload,
} from "../_component"
import type { LocationFormValues } from "../_component"

import { useAdminMutation } from "@/hooks/use-admin-mutation"
function NewLocationPageInner() {
  const crudNav = useAdminCrudNavigation("/locations")
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
