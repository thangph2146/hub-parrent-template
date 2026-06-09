"use client"
import { useCallback, useEffect } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { api } from "@/lib/api"
import {
  TemplateFormShell,
  useTemplateForm,
  useTemplateDetailQuery,
  buildTemplatePayload,
} from "../../_component"
import type { TemplateFormValues } from "../../_component"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
function EditTemplatePageInner() {
  const crudNav = useAdminCrudNavigation("/templates"),
    params = useParams(),
    id = params.id as string,
    qc = useQueryClient(),
    { form } = useTemplateForm()
  const {
    data: e,
    isLoading,
    isError,
    refetch,
  } = useTemplateDetailQuery(api, id)
  useEffect(() => {
    if (isError) {
      toast.error("Không tải được mẫu")
      crudNav.list()
    }
  }, [isError, crudNav])
  useHydrateOncePerEntity(id, e, (e) => {
    const draft = loadEntityDraft(buildEntityDraftKey("templates", id))
    if (draft) {
      form.reset(draft)
      return
    }
    form.reset({
      name: e.name ?? "",
      code: e.code ?? "",
      status: e.status ?? 1,
    })
  })
  const inv = async () => {
    await qc.invalidateQueries({ queryKey: ["templates"] })
  }
  const mut = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật "${String(variables.name ?? "")}"`,
      error: (e) => e.message || "Lỗi",
    },
    mutationFn: (i: Record<string, unknown>) => api.templates.update(id, i),
    onSuccess: async () => {
      await inv()
      crudNav.view(String(id))
    },
  })
  const h = useCallback(
    async (v: TemplateFormValues) => {
      await mut.mutateAsync(buildTemplatePayload(v))
    },
    [mut]
  )
  if (isLoading) return <AdminPageLoading variant="form" />
  if (!e) return null
  return (
    <AdminPageSection>
      <TemplateFormShell
        form={form}
        onSubmit={h}
        submitting={mut.isPending}
        editingId={id}
        onBack={() => crudNav.view(String(id))}
        onReset={async () => {
          await refetch()
        }}
      />
    </AdminPageSection>
  )
}
export default function EditTemplatePage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditTemplatePageInner />
    </AdminPageGuard>
  )
}
