"use client"

import type { Order, OrderStatus } from "@workspace/api-client"
import { Mail, Phone, ShoppingCart, User } from "lucide-react"
import {
  AdminFormMain,
  AdminFormSidebar,
} from "../admin/pages/admin-form-layout"
import {
  FieldSectionField,
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "../field"
import { StoreOrderStatusBadge } from "../badge-presets"
import { OrderAdminPaymentSummary } from "./order-admin-payment-summary"
import { OrderAdminStatusPicker } from "./order-admin-status-picker"
import { formatProductVnd } from "./product-money"

export type OrderAdminEditFormProps = {
  order: Order
  status: OrderStatus
  onStatusChange: (status: OrderStatus) => void
  pending?: boolean
}

export function OrderAdminEditForm({
  order,
  status,
  onStatusChange,
  pending = false,
}: OrderAdminEditFormProps) {
  const statusChanged = status !== order.status

  return (
    <>
      <AdminFormMain>
        <FieldSet variant="section">
          <FieldSectionLegend
            icon={ShoppingCart}
            title="Thông tin đơn"
            description="Dữ liệu read-only — chỉ cập nhật trạng thái vận hành."
          />
          <FieldSetContent
            variant="section"
            className="grid gap-4 sm:grid-cols-2"
          >
            <FieldSectionField
              label="Mã đơn"
              copyable
              copyText={order.orderNumber}
            >
              <span className="font-mono font-semibold">{order.orderNumber}</span>
            </FieldSectionField>
            <FieldSectionField label="Khách hàng" icon={User} copyable>
              {order.customerName}
            </FieldSectionField>
            <FieldSectionField label="Email" icon={Mail} copyable>
              {order.customerEmail}
            </FieldSectionField>
            <FieldSectionField label="SĐT" icon={Phone} copyable>
              {order.customerPhone || "—"}
            </FieldSectionField>
            <FieldSectionField label="Trạng thái hiện tại" copyable>
              <StoreOrderStatusBadge status={order.status} />
            </FieldSectionField>
            <FieldSectionField
              label="Tổng đơn"
              copyable
              copyText={formatProductVnd(order.totalAmount)}
            >
              <span className="font-bold tabular-nums text-primary">
                {formatProductVnd(order.totalAmount)}
              </span>
            </FieldSectionField>
          </FieldSetContent>
        </FieldSet>
      </AdminFormMain>

      <AdminFormSidebar className="space-y-4">
        <FieldSet variant="section">
          <FieldSectionLegend
            title="Trạng thái mới"
            description="Chọn trạng thái tiếp theo cho đơn hàng."
          />
          <FieldSetContent variant="section" className="space-y-3 pt-0">
            <OrderAdminStatusPicker
              value={status}
              onChange={onStatusChange}
              pending={pending}
            />
            {statusChanged ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                <span className="mb-1.5 block font-semibold text-foreground">
                  Thay đổi sẽ áp dụng
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <StoreOrderStatusBadge status={order.status} />
                  <span aria-hidden>→</span>
                  <StoreOrderStatusBadge status={status} />
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Trạng thái chưa thay đổi — bấm Lưu để quay lại chi tiết.
              </p>
            )}
          </FieldSetContent>
        </FieldSet>

        <OrderAdminPaymentSummary order={order} />
      </AdminFormSidebar>
    </>
  )
}
