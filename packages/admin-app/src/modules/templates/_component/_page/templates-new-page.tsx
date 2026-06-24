"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { TemplateFormShell } from "../_form"
import { useTemplateForm, buildTemplatePayload } from "../_hooks"
import type { TemplateFormValues } from "../shared/types"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewTemplatePageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("templates"),
    qc = useQueryClient(),
    { form } = useTemplateForm()
  const inv = async () => {
    await qc.invalidateQueries({ queryKey: ["templates"] })
  }
  const mut = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã tạo mẫu "${String(variables.name ?? "")}"`,
      error: (e) => e.message || "Lỗi",
    },
    mutationFn: (i: Record<string, unknown>) => api.templates.create(i),
    onSuccess: async () => {
      await inv()
      crudNav.list()
    },
  })
  const h = useCallback(
    async (v: TemplateFormValues) => {
      await mut.mutateAsync(buildTemplatePayload(v))
    },
    [mut]
  )
  return (
    <AdminPageSection>
      <TemplateFormShell
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
export default function NewTemplatePage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewTemplatePageInner />
    </AdminPageGuard>
  )
}
