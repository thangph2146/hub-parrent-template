"use client"

import type { ReactNode } from "react"
import type { Order } from "@workspace/api-client"
import { Banknote, CreditCard } from "lucide-react"
import { Badge } from "../badge"
import {
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "../field"
import { formatProductVnd } from "./product-money"
import { cn } from "../../lib/utils"

export type OrderAdminPaymentSummaryProps = {
  order: Pick<
    Order,
    | "subtotal"
    | "discountAmount"
    | "shippingFee"
    | "totalAmount"
    | "couponCode"
    | "isPaid"
    | "paymentMethod"
  >
  className?: string
}

function PaymentAmount({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn("font-medium tabular-nums", className)}>{children}</span>
  )
}

export function OrderAdminPaymentSummary({
  order,
  className,
}: OrderAdminPaymentSummaryProps) {
  return (
    <FieldSet variant="section" className={className}>
      <FieldSectionLegend icon={CreditCard} title="Thanh toán" />
      <FieldSetContent variant="section" className="space-y-3 pt-0">
        <FieldSectionField label="Tạm tính">
          <PaymentAmount>{formatProductVnd(order.subtotal)}</PaymentAmount>
        </FieldSectionField>

        {order.discountAmount > 0 ? (
          <FieldSectionField
            label={
              order.couponCode
                ? `Giảm giá (${order.couponCode})`
                : "Giảm giá"
            }
          >
            <PaymentAmount className="text-emerald-600 dark:text-emerald-400">
              −{formatProductVnd(order.discountAmount)}
            </PaymentAmount>
          </FieldSectionField>
        ) : null}

        {order.shippingFee > 0 ? (
          <FieldSectionField label="Phí giao hàng">
            <PaymentAmount>{formatProductVnd(order.shippingFee)}</PaymentAmount>
          </FieldSectionField>
        ) : null}

        <FieldSectionDivider />

        <FieldSectionField
          label="Tổng cộng"
          valueClassName="border-primary/20 bg-primary/5"
        >
          <span className="text-xl font-black tracking-tight text-primary tabular-nums">
            {formatProductVnd(order.totalAmount)}
          </span>
        </FieldSectionField>

        <FieldSectionField label="Phương thức" icon={Banknote}>
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {order.paymentMethod === "cod"
                ? "Thanh toán khi nhận (COD)"
                : order.paymentMethod}
            </span>
            <Badge variant={order.isPaid ? "success" : "secondary"} size="sm">
              {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
            </Badge>
          </span>
        </FieldSectionField>
      </FieldSetContent>
    </FieldSet>
  )
}
