"use client"

import { useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { api } from "@/lib/api"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
import {
  PromoFormShell,
  usePromoForm,
  buildPromoUpdatePayload,
  promoToFormValues,
  usePromoDetailQuery,
  type PromoFormValues,
} from "../../_component"

function EditPromoPageInner() {
  const crudNav = useAdminCrudNavigation("/promo-codes")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { form } = usePromoForm()

  const { data, isLoading, isError } = usePromoDetailQuery(api, id)

  useEffect(() => {
    if (data) form.reset(promoToFormValues(data))
  }, [data, form])

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
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] })
      crudNav.list()
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
        onBack={() => crudNav.list()}
        onReset={() => form.reset(promoToFormValues(data))}
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
