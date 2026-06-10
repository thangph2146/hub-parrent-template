"use client"
import { useCallback, useEffect, useMemo } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import {
  ScreenFormShell,
  useScreenForm,
  useScreenDetailQuery,
  buildScreenPayload,
} from "../../_component"
import type { ScreenFormValues } from "../../_component"
import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
function EditScreenPageInner() {
  const crudNav = useAdminCrudNavigation("/admin-checkin-su-kien/screens"),
    params = useParams(),
    id = params.id as string,
    qc = useQueryClient(),
    { form } = useScreenForm()
  const { data: e, isLoading, isError, refetch } = useScreenDetailQuery(api, id)
  const { data: camerasData } = useQuery({
    queryKey: ["cameras", "options"],
    queryFn: () =>
      api.cameras.list<{ id: string; name: string }>({
        status: "active",
        limit: 999,
      }),
  })
  const { data: templatesData } = useQuery({
    queryKey: ["templates", "options"],
    queryFn: () =>
      api.templates.list<{ id: string; name: string }>({
        status: "active",
        limit: 999,
      }),
  })
  const cameraOptions = useMemo(
    () =>
      (camerasData?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
    [camerasData]
  )
  const templateOptions = useMemo(
    () =>
      (templatesData?.items ?? []).map((t) => ({ value: t.id, label: t.name })),
    [templatesData]
  )
  useEffect(() => {
    if (isError) {
      toast.error("Không tải được màn hình")
      crudNav.list()
    }
  }, [isError, crudNav])
  useHydrateOncePerEntity(id, e, (e) => {
    const draft = loadEntityDraft(buildEntityDraftKey("screens", id))
    if (draft) {
      form.reset(draft)
      return
    }
    form.reset({
      name: e.name ?? "",
      code: e.code ?? "",
      cameraId: e.cameraId ?? "",
      cameraName: e.cameraName ?? "",
      templateId: e.templateId ?? "",
      templateName: e.templateName ?? "",
      status: e.status ?? 1,
    })
  })
  const inv = async () => {
    await qc.invalidateQueries({ queryKey: ["screens"] })
  }
  const mut = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật "${String(variables.name ?? "")}"`,
      error: (e) => e.message || "Lỗi",
    },
    mutationFn: (i: Record<string, unknown>) => api.screens.update(id, i),
    onSuccess: async () => {
      await inv()
      crudNav.view(String(id))
    },
  })
  const h = useCallback(
    async (v: ScreenFormValues) => {
      await mut.mutateAsync(buildScreenPayload(v))
    },
    [mut]
  )
  if (isLoading) return <AdminPageLoading variant="form" />
  if (!e) return null
  return (
    <AdminPageSection>
      <ScreenFormShell
        form={form}
        onSubmit={h}
        submitting={mut.isPending}
        editingId={id}
        cameraOptions={cameraOptions}
        templateOptions={templateOptions}
        onBack={() => crudNav.view(String(id))}
        onReset={async () => {
          await refetch()
        }}
      />
    </AdminPageSection>
  )
}
export default function EditScreenPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditScreenPageInner />
    </AdminPageGuard>
  )
}
