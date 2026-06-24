"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"
import {
  AdminDetailPageHeader,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
  ProductAdminDetail,
} from "@ui/components/admin"
import {useAdminApi, useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"

import { useProductDetailQuery } from "../_query/use-products-queries"

function ProductDetailInner() {
  const api = useAdminApi()
  const crudNav = useAdminModuleNavigation("products")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.PRODUCTS_UPDATE)
    : false
  const { data: product, isLoading, isError } = useProductDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được sản phẩm")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!product) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title="Chi tiết sản phẩm"
        subtitle={
          <span className="font-mono text-sm text-muted-foreground">
            {product.sku}
          </span>
        }
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(id) : undefined}
      />
      <ProductAdminDetail
        product={product}
      />
    </AdminPageSection>
  )
}

export default function ProductDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <ProductDetailInner />
    </AdminPageGuard>
  )
}
