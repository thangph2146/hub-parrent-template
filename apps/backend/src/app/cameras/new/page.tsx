"use client"

import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { api } from "@/lib/api"
import {
  CameraFormShell,
  useCameraForm,
  buildCameraPayload,
} from "../_component"
import type { CameraFormValues } from "../_component"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
function NewCameraPageInner() {
  const crudNav = useAdminCrudNavigation("/cameras"),
    qc = useQueryClient(),
    { form } = useCameraForm()
  const inv = async () => {
    await qc.invalidateQueries({ queryKey: ["cameras"] })
  }
  const mut = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo camera "${String(variables.name ?? "")}"`,
      error: (e) => e.message || "Lỗi",
    },
    mutationFn: (i: Record<string, unknown>) => api.cameras.create(i),
    onSuccess: async () => {
      await inv()
      crudNav.list()
    },
  })
  const h = useCallback(
    async (v: CameraFormValues) => {
      await mut.mutateAsync(buildCameraPayload(v))
    },
    [mut]
  )
  return (
    <AdminPageSection>
      <CameraFormShell
        form={form}
        onSubmit={h}
        submitting={mut.isPending}
        editingId={null}
        onBack={() => crudNav.list()}
        onReset={() => form.reset()}
      />
    </AdminPageSection>
  )
}
export default function NewCameraPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewCameraPageInner />
    </AdminPageGuard>
  )
}
