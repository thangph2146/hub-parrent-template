"use client"
import { useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { ScreenFormShell } from "../_form"
import { useScreenForm, buildScreenSubmitPayload } from "../_hooks"
import type { ScreenFormValues } from "../shared/types"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewScreenPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("screens"),
    qc = useQueryClient(),
    { form } = useScreenForm()
  const inv = async () => {
    await qc.invalidateQueries({ queryKey: ["screens"] })
  }
  const mut = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo màn hình "${String(variables.name ?? "")}"`,
      error: (e) => e.message || "Lỗi",
    },
    mutationFn: (i: Record<string, unknown>) => api.screens.create(i),
    onSuccess: async () => {
      await inv()
      crudNav.list()
    },
  })
  const h = useCallback(
    async (v: ScreenFormValues) => {
      await mut.mutateAsync(await buildScreenSubmitPayload(api, v))
    },
    [api, mut]
  )
  return (
    <AdminPageSection>
      <ScreenFormShell
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
export default function NewScreenPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewScreenPageInner />
    </AdminPageGuard>
  )
}
