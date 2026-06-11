"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin"
import { Badge } from "@ui/components/badge"
import { ActiveStatusBadge } from "@ui/components/product"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useAdminEditFormHydration } from "@workspace/admin-app/hooks/use-admin-edit-form-hydration"
import {
  PromoFormShell,
  usePromoForm,
  buildPromoUpdatePayload,
  promoToFormValues,
  usePromoDetailQuery,
  type PromoFormValues,
} from "../../_component"

function EditPromoPageInner() {
  const crudNav = useAdminModuleNavigation("promo-codes")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = usePromoForm()

  const { data, isLoading, isError } = usePromoDetailQuery(api, id)

  const { clearDraft, resetFromServer } = useAdminEditFormHydration({
    scope: "promo-codes",
    entityId: id,
    data,
    form,
    toFormValues: promoToFormValues,
    mergeDraft: (draft, server) => ({ ...server, ...draft, code: server.code }),
  })

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được mã KM")
      crudNav.list()
    }
  }, [isError, crudNav])

  const updateMutation = useAdminMutation({
    mutationFn: (body: ReturnType<typeof buildPromoUpdatePayload>) =>
      api.promoCodes.update(Number(id), body),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] })
      toast.success("Đã cập nhật mã khuyến mãi")
      crudNav.view(id)
    },
  })

  const handleSubmit = useCallback(
    async (values: PromoFormValues) => {
      await updateMutation.mutateAsync(buildPromoUpdatePayload(values))
    },
    [updateMutation]
  )

  if (isLoading) return <AdminPageLoading />
  if (!data) return null

  return (
    <AdminPageSection>
      <PromoFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={id}
        onBack={() => crudNav.view(id)}
        onReset={resetFromServer}
        usageCount={data.usageCount}
        headerTitle={
          <span className="flex flex-wrap items-center gap-2.5">
            <span>Sửa mã KM</span>
            <Badge variant="coupon" className="font-mono text-sm">
              {data.code}
            </Badge>
            <ActiveStatusBadge
              active={data.isActive}
              activeLabel="Đang bật"
              inactiveLabel="Đã tắt"
            />
          </span>
        }
        headerSubtitle={data.label}
      />
    </AdminPageSection>
  )
}

export default function EditPromoPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditPromoPageInner />
    </AdminPageGuard>
  )
}
