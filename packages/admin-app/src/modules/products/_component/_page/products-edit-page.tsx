"use client"
import { useAdminApi, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useAdminEditFormHydration } from "@workspace/admin-app/hooks/use-admin-edit-form-hydration"
import { ProductFormShell, useProductForm, buildProductPayload, productToFormValues } from "../_form/product-form"
import { useProductDetailQuery } from "../_query/use-products-queries"
import type { ProductFormValues } from "../shared/types"

function EditProductPageInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("products")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useProductDetailQuery(api, id)
  const { form } = useProductForm()

  const { clearDraft, resetFromServer } = useAdminEditFormHydration({
    scope: "products",
    entityId: id,
    data,
    form,
    toFormValues: productToFormValues,
  })

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được sản phẩm")
      crudNav.list()
    }
  }, [isError, crudNav])

  const updateMutation = useAdminMutation({
    mutationKey: ["products", "update", id],
    toast: {
      loading: "Đang lưu sản phẩm…",
      success: () => "Đã cập nhật sản phẩm",
      error: (err) =>
        err instanceof Error ? err.message : "Không thể cập nhật sản phẩm",
    },
    mutationFn: (body: ReturnType<typeof buildProductPayload>) =>
      api.products.update(Number(id), body),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      crudNav.view(id)
    },
  })

  const handleSubmit = useCallback(
    async (values: ProductFormValues) => {
      await updateMutation.mutateAsync(buildProductPayload(values))
    },
    [updateMutation]
  )

  if (isLoading) return <AdminPageLoading />
  if (!data) return null

  return (
    <AdminPageSection>
      <ProductFormShell
        form={form}
        onSubmit={handleSubmit}
        submitting={updateMutation.isPending}
        editingId={id}
        onBack={() => crudNav.view(id)}
        onReset={resetFromServer}
      />
    </AdminPageSection>
  )
}

export default function EditProductPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <EditProductPageInner />
    </AdminPageGuard>
  )
}
