"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { ProductFormShell, useProductForm, buildProductPayload } from "../_form/product-form"
import type { ProductFormValues } from "../shared/types"

function NewProductPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("products")
  const queryClient = useQueryClient()
  const { form } = useProductForm()

  const createMutation = useAdminMutation({
    mutationFn: (body: ReturnType<typeof buildProductPayload>) =>
      api.products.create(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      crudNav.list()
    },
  })

  const handleSubmit = useCallback(
    async (values: ProductFormValues) => {
      await createMutation.mutateAsync(buildProductPayload(values))
    },
    [createMutation]
  )

  return (
    <AdminPageSection>
      <ProductFormShell
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

export default function NewProductPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <NewProductPageInner />
    </AdminPageGuard>
  )
}
