"use client"
import { useAdminModuleNavigation, useAdminApi } from "@workspace/admin-app/runtime"
import { useCallback, useEffect } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { ScreenFormShell } from "../_form"
import { useScreenForm, buildScreenSubmitPayload } from "../_hooks"
import { useScreenDetailQuery } from "../_query"
import type { ScreenFormValues } from "../shared/types"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
function EditScreenPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("screens"),
    params = useParams(),
    id = params.id as string,
    qc = useQueryClient(),
    { form } = useScreenForm()
  const { data: e, isLoading, isError, refetch } = useScreenDetailQuery(api, id)
  const { data: linkedCamera } = useQuery({
    queryKey: ["cameras", "detail", e?.cameraId],
    queryFn: () =>
      api.cameras.get<{ code: string | null; name: string }>(String(e!.cameraId)),
    enabled: Boolean(e?.cameraId),
  })
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
      hanetDeviceId: "",
      cameraId: e.cameraId ?? "",
      cameraName: e.cameraName ?? "",
      status: e.status ?? 1,
    })
  })
  useEffect(() => {
    if (!linkedCamera?.code) return
    form.setValue("hanetDeviceId", linkedCamera.code)
    if (linkedCamera.name) {
      form.setValue("cameraName", linkedCamera.name)
    }
  }, [linkedCamera?.code, linkedCamera?.name, form])
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
      await mut.mutateAsync(await buildScreenSubmitPayload(api, v))
    },
    [api, mut]
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
