"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import {
  AdminFormLayout,
  AdminFormPageHeader,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
  OrderAdminEditForm,
  StoreOrderStatusBadge,
} from "@ui/components/admin"
import { useEntityDraftState } from "@workspace/query-client"
import {useAdminAuth as useAuth, useAdminModuleNavigation } from "@workspace/admin-app/runtime"
import {
  canUserAccess,
  PERMISSION_CODES,
  type OrderStatus,
} from "@workspace/api-client"
import { api } from "@workspace/admin-app/lib/api"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useOrderDetailQuery } from "../../_component"

function OrderEditInner() {
  const crudNav = useAdminModuleNavigation("orders")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.ORDERS_UPDATE) ||
      canUserAccess(user, PERMISSION_CODES.ORDERS_MANAGE)
    : false
  const { data: order, isLoading, isError } = useOrderDetailQuery(api, id)

  const {
    state: statusDraft,
    setState: setStatusDraft,
    clearDraft,
  } = useEntityDraftState("orders", id, order, (o) => ({ status: o.status }))

  useEffect(() => {
    if (isError) {
      toast.error("Không tải được đơn hàng")
      crudNav.list()
    }
  }, [isError, crudNav])

  useEffect(() => {
    if (!isLoading && order && !canUpdate) {
      crudNav.view(id)
    }
  }, [canUpdate, crudNav, id, isLoading, order])

  const updateMutation = useAdminMutation({
    mutationFn: (next: OrderStatus) =>
      api.orders.updateStatus(Number(id), next),
    onSuccess: async () => {
      clearDraft()
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Đã cập nhật trạng thái đơn hàng")
      crudNav.view(id)
    },
  })

  if (isLoading) return <AdminPageLoading />
  if (!order) return null

  const currentStatus = statusDraft?.status ?? order.status
  const statusChanged = currentStatus !== order.status

  return (
    <AdminPageSection>
      <AdminFormPageHeader
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            <span>Cập nhật đơn hàng</span>
            <StoreOrderStatusBadge status={order.status} />
          </span>
        }
        subtitle={
          <span className="font-mono text-sm">{order.orderNumber}</span>
        }
        onBack={() => crudNav.view(id)}
        formId="order-status-form"
        submitting={updateMutation.isPending}
        isEdit
        saveLabel={statusChanged ? "Lưu trạng thái" : "Quay lại chi tiết"}
      />
      <AdminFormLayout
        id="order-status-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (!statusChanged) {
            crudNav.view(id)
            return
          }
          updateMutation.mutate(currentStatus)
        }}
      >
        <OrderAdminEditForm
          order={order}
          status={currentStatus}
          onStatusChange={(next) => setStatusDraft({ status: next })}
          pending={updateMutation.isPending}
        />
      </AdminFormLayout>
    </AdminPageSection>
  )
}

export default function OrderEditPage() {
  return (
    <AdminPageGuard roles={["super_admin", "admin", "manager"]}>
      <OrderEditInner />
    </AdminPageGuard>
  )
}
