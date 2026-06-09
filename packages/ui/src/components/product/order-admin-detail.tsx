"use client"

import type { Order } from "@workspace/api-client"
import { Gift, Mail, MapPin, Phone, ShoppingCart, StickyNote } from "lucide-react"
import {
  AdminDetailLayout,
  AdminDetailMain,
  AdminDetailSidebar,
} from "../admin/pages/admin-detail-layout"
import {
  FieldSectionBadge,
  FieldSectionField,
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "../field"
import {
  OrderAdminGiftLineItem,
  OrderAdminLineItem,
} from "./order-admin-line-item"
import { OrderAdminPaymentSummary } from "./order-admin-payment-summary"

export type OrderAdminDetailProps = {
  order: Order
  className?: string
}

export function OrderAdminDetail({ order, className }: OrderAdminDetailProps) {
  const itemCount = order.items.length
  const giftCount = order.gifts?.length ?? 0

  return (
    <AdminDetailLayout className={className}>
      <AdminDetailMain className="space-y-6">
        <FieldSet variant="section">
          <FieldSectionLegend icon={ShoppingCart} title="Khách hàng" />
          <FieldSetContent
            variant="section"
            className="grid gap-4 sm:grid-cols-2"
          >
            <FieldSectionField label="Email" icon={Mail} copyable>
              {order.customerEmail}
            </FieldSectionField>
            <FieldSectionField label="SĐT" icon={Phone} copyable>
              {order.customerPhone || "—"}
            </FieldSectionField>
            <FieldSectionField
              label="Địa chỉ giao hàng"
              icon={MapPin}
              className="sm:col-span-2"
              copyable
            >
              {order.shippingAddress || "—"}
            </FieldSectionField>
            {order.notes ? (
              <FieldSectionField
                label="Ghi chú"
                icon={StickyNote}
                className="sm:col-span-2"
                copyable
              >
                {order.notes}
              </FieldSectionField>
            ) : null}
          </FieldSetContent>
        </FieldSet>

        <FieldSet variant="section">
          <FieldSectionLegend
            title="Sản phẩm (snapshot)"
            description="Dữ liệu cố định tại thời điểm khách đặt hàng."
            badge={
              itemCount > 0 ? (
                <FieldSectionBadge>{itemCount}</FieldSectionBadge>
              ) : undefined
            }
          />
          <FieldSetContent variant="section" className="space-y-3 pt-0">
            {order.items.map((item, idx) => (
              <OrderAdminLineItem
                key={`${item.productId}-${item.sku}-${idx}`}
                item={item}
              />
            ))}
          </FieldSetContent>
        </FieldSet>

        {giftCount > 0 ? (
          <FieldSet variant="section">
            <FieldSectionLegend
              icon={Gift}
              title="Quà tặng (snapshot)"
              badge={<FieldSectionBadge>{giftCount}</FieldSectionBadge>}
            />
            <FieldSetContent variant="section" className="space-y-3 pt-0">
              {order.gifts!.map((gift, idx) => (
                <OrderAdminGiftLineItem
                  key={`${gift.ruleId ?? gift.sku ?? gift.name}-${idx}`}
                  gift={gift}
                />
              ))}
            </FieldSetContent>
          </FieldSet>
        ) : null}
      </AdminDetailMain>

      <AdminDetailSidebar className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <OrderAdminPaymentSummary order={order} />
      </AdminDetailSidebar>
    </AdminDetailLayout>
  )
}
