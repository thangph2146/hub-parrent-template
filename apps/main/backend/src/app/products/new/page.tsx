"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AdminPageGuard, AdminPageSection } from "@ui/components/admin"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { api } from "@/lib/api"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
import {
  ProductFormShell,
  useProductForm,
  buildProductPayload,
  type ProductFormValues,
} from "../_component"

function NewProductPageInner() {
  const crudNav = useAdminCrudNavigation("/products")
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
