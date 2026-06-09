"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ShoppingCart } from "lucide-react"
import { toast } from "@ui/components/sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select"
import {
  AdminFormLayout,
  AdminFormMain,
  AdminFormPageHeader,
  AdminFormSidebar,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin"
import {
  FieldSectionField,
  FieldSet,
  FieldSetContent,
  FieldSectionLegend,
} from "@ui/components/field"
import { StoreOrderStatusBadge } from "@ui/components/product"
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useAuth } from "@/providers/auth-provider"
import {
  canUserAccess,
  PERMISSION_CODES,
  type OrderStatus,
} from "@workspace/api-client"
import { api } from "@/lib/api"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  useOrderDetailQuery,
} from "../../_component"

function OrderEditInner() {
  const crudNav = useAdminCrudNavigation("/orders")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.ORDERS_UPDATE) ||
      canUserAccess(user, PERMISSION_CODES.ORDERS_MANAGE)
    : false
  const { data: order, isLoading, isError } = useOrderDetailQuery(api, id)
  const [status, setStatus] = useState<OrderStatus | null>(null)

  useEffect(() => {
    if (order) setStatus(order.status)
  }, [order])

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
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      crudNav.view(id)
    },
  })

  if (isLoading) return <AdminPageLoading />
  if (!order) return null

  const currentStatus = status ?? order.status

  return (
    <AdminPageSection>
      <AdminFormPageHeader
        title="Cập nhật đơn hàng"
        subtitle={order.orderNumber}
        onBack={() => crudNav.view(id)}
        formId="order-status-form"
        submitting={updateMutation.isPending}
        isEdit
        saveLabel="Lưu trạng thái"
      />
      <AdminFormLayout
        id="order-status-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (currentStatus === order.status) {
            crudNav.view(id)
            return
          }
          updateMutation.mutate(currentStatus)
        }}
      >
        <AdminFormMain>
          <FieldSet variant="section">
            <FieldSectionLegend icon={ShoppingCart} title="Thông tin đơn" />
            <FieldSetContent
              variant="section"
              className="grid gap-4 sm:grid-cols-2"
            >
              <FieldSectionField label="Mã đơn">
                <span className="font-mono">{order.orderNumber}</span>
              </FieldSectionField>
              <FieldSectionField label="Khách hàng">
                {order.customerName}
              </FieldSectionField>
              <FieldSectionField label="Email">
                {order.customerEmail}
              </FieldSectionField>
              <FieldSectionField label="Trạng thái hiện tại">
                <StoreOrderStatusBadge status={order.status} />
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>
        </AdminFormMain>
        <AdminFormSidebar>
          <FieldSet variant="section">
            <FieldSectionLegend title="Trạng thái mới" />
            <FieldSetContent variant="section" className="pt-0">
              <Select
                value={currentStatus}
                onValueChange={(v) => setStatus(v as OrderStatus)}
                disabled={updateMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldSetContent>
          </FieldSet>
        </AdminFormSidebar>
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
