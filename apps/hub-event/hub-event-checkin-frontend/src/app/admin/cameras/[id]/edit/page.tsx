"use client"
import { useCallback, useEffect } from "react"
import {
  buildEntityDraftKey,
  loadEntityDraft,
  useHydrateOncePerEntity,
} from "@workspace/query-client"
import { useParams } from "next/navigation"
import { useAdminCrudNavigation } from "@/lib/admin/admin-navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageSection,
  AdminPageLoading,
} from "@ui/components/admin"
import { api } from "@/lib/admin/api"
import {
  CameraFormShell,
  useCameraForm,
  useCameraDetailQuery,
  buildCameraPayload,
} from "../../_component"
import type { CameraFormValues } from "../../_component"
import { useAdminMutation } from "@/hooks/admin/use-admin-mutation"
function EditCameraPageInner() {
  const crudNav = useAdminCrudNavigation("/admin/cameras"),
    params = useParams(),
    id = params.id as string,
    qc = useQueryClient(),
    { form } = useCameraForm()
  const { data: e, isLoading, isError, refetch } = useCameraDetailQuery(api, id)
  useEffect(() => {
    if (isError) {
      toast.error("Không tải được camera")
      crudNav.list()
    }
  }, [isError, crudNav])
  useHydrateOncePerEntity(id, e, (e) => {
    const draft = loadEntityDraft(buildEntityDraftKey("cameras", id))
    if (draft) {
      form.reset(draft)
      return
    }
    form.reset({
      name: e.name ?? "",
      code: e.code ?? "",
      linkedEventId: e.linkedEventId ?? "",
      ipAddress: e.ipAddress ?? "",
      port: e.port ?? undefined,
      username: e.username ?? "",
      password: "",
      status: e.status ?? 1,
    })
  })
  const inv = async () => {
    await qc.invalidateQueries({ queryKey: ["cameras"] })
  }
  const mut = useAdminMutation({
    toast: {
      loading: "Đang thực hiện…",
      success: (_data, variables) =>
        `Đã cập nhật "${String(variables.name ?? "")}"`,
      error: (e) => e.message || "Lỗi",
    },
    mutationFn: (i: Record<string, unknown>) => api.cameras.update(id, i),
    onSuccess: async () => {
      await inv()
      crudNav.view(String(id))
    },
  })
  const h = useCallback(
    async (v: CameraFormValues) => {
      await mut.mutateAsync(buildCameraPayload(v))
    },
    [mut]
  )
  if (isLoading) return <AdminPageLoading variant="form" />
  if (!e) return null
  return (
    <AdminPageSection>
      <CameraFormShell
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
export default function EditCameraPage() {
  return (
    <AdminPageGuard permission={PERMISSION_CODES.CAMERAS_UPDATE}>
      <EditCameraPageInner />
    </AdminPageGuard>
  )
}
