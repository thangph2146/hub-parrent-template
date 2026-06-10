import { PERMISSION_CODES } from "@workspace/api-client"
"use client"

import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { useCallback, useMemo } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import {
  ScreenFormShell,
  useScreenForm,
  buildScreenPayload,
} from "../_component"
import type { ScreenFormValues } from "../_component"
import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
function NewScreenPageInner() {
  const crudNav = useAdminCrudNavigation("/admin/screens"),
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
    <AdminPageGuard permission={PERMISSION_CODES.SCREENS_CREATE}>
      <NewScreenPageInner />
    </AdminPageGuard>
  )
}
