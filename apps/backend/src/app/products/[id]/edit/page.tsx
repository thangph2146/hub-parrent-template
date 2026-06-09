"use client"

import { useCallback, useEffect, useRef } from "react"
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
  ProductFormShell,
  useProductForm,
  buildProductPayload,
  productToFormValues,
  useProductDetailQuery,
  type ProductFormValues,
} from "../../_component"

function EditProductPageInner() {
  const crudNav = useAdminCrudNavigation("/products")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useProductDetailQuery(api, id)
  const { form } = useProductForm()
  const hydratedIdRef = useRef<string | null>(null)

  useEffect(() => {
    hydratedIdRef.current = null
  }, [id])

  useEffect(() => {
    if (!data || hydratedIdRef.current === id) return
    form.reset(productToFormValues(data))
    hydratedIdRef.current = id
  }, [data, form, id])

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
        onReset={() => form.reset(productToFormValues(data))}
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
