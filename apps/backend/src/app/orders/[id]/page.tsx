"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { toast } from "@ui/components/sonner"
import { Badge } from "@ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailPageHeader,
  AdminDetailSidebar,
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
import { useAdminCrudNavigation } from "@/lib/admin-navigation"
import { useAuth } from "@/providers/auth-provider"
import {
  canUserAccess,
  PERMISSION_CODES,
  type OrderStatus,
} from "@workspace/api-client"
import { api } from "@/lib/api"
import { useAdminMutation } from "@/hooks/use-admin-mutation"
import { useQueryClient } from "@tanstack/react-query"
import { ORDER_STATUS_LABELS, useOrderDetailQuery } from "../_component"

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + " ₫"
}

function OrderDetailInner() {
  const crudNav = useAdminCrudNavigation("/orders")
  const params = useParams()
  const id = params.id as string
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const canUpdate = user
    ? canUserAccess(user, PERMISSION_CODES.ORDERS_UPDATE)
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

  const statusMutation = useAdminMutation({
    mutationFn: (next: OrderStatus) =>
      api.orders.updateStatus(Number(id), next),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Đã cập nhật trạng thái")
    },
  })

  if (isLoading) return <AdminPageLoading />
  if (!order) return null

  return (
    <AdminPageSection>
      <AdminDetailPageHeader
        title={order.orderNumber}
        subtitle={order.customerName}
        onBack={() => crudNav.list()}
      />
      <AdminDetailLayout>
        <AdminDetailMain className="space-y-6">
          <FieldSet variant="section">
            <FieldSectionLegend icon={ShoppingCart} title="Khách hàng" />
            <FieldSetContent
              variant="section"
              className="grid gap-4 sm:grid-cols-2"
            >
              <FieldSectionField label="Email">
                {order.customerEmail}
              </FieldSectionField>
              <FieldSectionField label="SĐT">
                {order.customerPhone || "—"}
              </FieldSectionField>
              <FieldSectionField label="Địa chỉ" className="sm:col-span-2">
                {order.shippingAddress || "—"}
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend title="Sản phẩm (snapshot)" />
            <FieldSetContent variant="section" className="space-y-4 pt-0">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.sku}-${idx}`}
                  className="flex gap-4 rounded-lg border p-3"
                >
                  {item.image ? (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variantSku ?? item.sku} · {item.quantity} ×{" "}
                      {item.unitLabel || item.unitType}
                    </p>
                    {item.listUnitPrice &&
                    item.listUnitPrice > item.unitPrice ? (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatVnd(item.listUnitPrice)}/đv
                      </p>
                    ) : null}
                    <p className="text-sm font-medium">
                      {formatVnd(item.totalPrice)}
                    </p>
                    {item.giftNote ? (
                      <p className="text-xs text-primary">{item.giftNote}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </FieldSetContent>
          </FieldSet>

          {order.gifts && order.gifts.length > 0 ? (
            <FieldSet variant="section">
              <FieldSectionLegend title="Quà tặng (snapshot)" />
              <FieldSetContent variant="section" className="space-y-3 pt-0">
                {order.gifts.map((gift, idx) => (
                  <div
                    key={`${gift.ruleId ?? gift.sku ?? gift.name}-${idx}`}
                    className="flex gap-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3"
                  >
                    {gift.image ? (
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={gift.image}
                          alt={gift.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div>
                      <p className="font-medium">{gift.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {gift.label} · SL {gift.qty}
                        {gift.sku ? ` · ${gift.sku}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </FieldSetContent>
            </FieldSet>
          ) : null}
        </AdminDetailMain>

        <AdminDetailSidebar className="space-y-4">
          <FieldSet variant="section">
            <FieldSectionLegend title="Thanh toán" />
            <FieldSetContent variant="section" className="space-y-2 pt-0">
              <FieldSectionField label="Tạm tính">
                {formatVnd(order.subtotal)}
              </FieldSectionField>
              {order.discountAmount > 0 ? (
                <FieldSectionField label="Giảm giá">
                  −{formatVnd(order.discountAmount)}
                  {order.couponCode ? ` (${order.couponCode})` : ""}
                </FieldSectionField>
              ) : null}
              <FieldSectionField label="Tổng">
                <span className="text-lg font-semibold">
                  {formatVnd(order.totalAmount)}
                </span>
              </FieldSectionField>
              <FieldSectionField label="COD">
                <Badge variant={order.isPaid ? "default" : "secondary"}>
                  {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </Badge>
              </FieldSectionField>
            </FieldSetContent>
          </FieldSet>

          <FieldSet variant="section">
            <FieldSectionLegend title="Trạng thái" />
            <FieldSetContent variant="section" className="pt-0">
              {canUpdate ? (
                <Select
                  value={status ?? order.status}
                  onValueChange={(v) => {
                    const next = v as OrderStatus
                    setStatus(next)
                    statusMutation.mutate(next)
                  }}
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {ORDER_STATUS_LABELS[s]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge>
              )}
            </FieldSetContent>
          </FieldSet>
        </AdminDetailSidebar>
      </AdminDetailLayout>
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
