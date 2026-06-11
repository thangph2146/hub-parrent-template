"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import {
  ScreenFormShell,
  useScreenForm,
  buildScreenPayload,
} from "../_component"
import type { ScreenFormValues } from "../_component"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function NewScreenPageInner() {
  const crudNav = useAdminModuleNavigation("screens"),
    qc = useQueryClient(),
    { form } = useScreenForm()
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
      await mut.mutateAsync(buildScreenPayload(v))
    },
    [mut]
  )
  return (
    <AdminPageSection>
      <ScreenFormShell
        form={form}
        onSubmit={h}
        submitting={mut.isPending}
        editingId={null}
        cameraOptions={cameraOptions}
        templateOptions={templateOptions}
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
