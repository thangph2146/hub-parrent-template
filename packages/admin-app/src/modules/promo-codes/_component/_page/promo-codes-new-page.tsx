"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { PromoFormShell, usePromoForm, buildPromoPayload, PromoFormValues } from "../_form/promo-form"

function NewPromoPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("promo-codes")
  const queryClient = useQueryClient()
  const { form } = usePromoForm()

  const createMutation = useAdminMutation({
    mutationFn: (body: ReturnType<typeof buildPromoPayload>) =>
      api.promoCodes.create(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] })
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: PromoFormValues) => {
      await createMutation.mutateAsync(buildPromoPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <PromoFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending}
        editingId={null}
        onBack={() => crudNav.list()}
        onReset={() => form.reset()}
      />
    </AdminPageSection>
  )
}

export default function NewPromoPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewPromoPageInner />
    </AdminPageGuard>
  )
}
