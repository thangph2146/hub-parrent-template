"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "@ui/components/sonner"
import {
  AdminDetailPageHeader,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
  OrderAdminDetail,
  StoreOrderStatusBadge,
} from "@ui/components/admin"
import { formatAdminDateTime } from "@ui/lib/format-admin-datetime"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { api } from "@workspace/admin-app/lib/api"
import { useOrderDetailQuery } from "../_component"

function OrderDetailInner() {
  const crudNav = useAdminModuleNavigation("orders")
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.ORDERS_UPDATE) ||
      canUserAccess(user, PERMISSION_CODES.ORDERS_MANAGE)
    : false
  const { data: order, isLoading, isError } = useOrderDetailQuery(api, id)

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được đơn hàng")
      crudNav.list()
    }
  }, [isError, crudNav])

  if (isLoading) return <AdminPageLoading />
  if (!order) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span>{order.orderNumber}</span>
            <StoreOrderStatusBadge status={order.status} />
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-medium text-foreground">
              {order.customerName}
            </span>
            <span className="text-muted-foreground" aria-hidden>
              ·
            </span>
            <span>{formatAdminDateTime(order.createdAt)}</span>
          </span>
        }
        onBack={() => crudNav.list()}
        onEdit={canUpdate ? () => crudNav.edit(id) : undefined}
      />

      <OrderAdminDetail order={order} />
    </AdminPageSection>
  )
}

export default function OrderDetailPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <OrderDetailInner />
    </AdminPageGuard>
  )
}
