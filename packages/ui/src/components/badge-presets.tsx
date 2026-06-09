"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { OrderStatus } from "@workspace/api-client"
import type { VariantProps } from "class-variance-authority"
import { Badge, badgeVariants } from "./badge"
import { cn } from "../lib/utils"

export type ProductStockStatus = "ok" | "low" | "out"

export const STOCK_BADGE_VARIANT: Record<
  ProductStockStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  ok: "success",
  low: "warning",
  out: "destructive",
}

const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  pending: "warning",
  confirmed: "promo",
  shipped: "category",
  delivered: "success",
  cancelled: "destructive",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao hàng",
  delivered: "Giao thành công",
  cancelled: "Đã huỷ",
}

export type StoreOrderRowStatus = "shipping" | "completed" | "cancelled"

const STORE_ORDER_ROW_VARIANT: Record<
  StoreOrderRowStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  shipping: "promo",
  completed: "success",
  cancelled: "destructive",
}

/** Tồn kho theo loại hàng — dùng chung CTSP, catalog card, stepper. */
export function ProductStockBadge({
  count,
  status = "ok",
  className,
}: {
  count: number
  status?: ProductStockStatus
  className?: string
}) {
  return (
    <Badge
      variant={STOCK_BADGE_VARIANT[status]}
      size="xs"
      shape="pill"
      className={cn("tabular-nums", className)}
    >
      Tồn{" "}
      <span className="font-bold">{count.toLocaleString("vi-VN")}</span>
    </Badge>
  )
}

/** Nhãn giá KM / giá lẻ khi có wholesale. */
export function ProductPriceTierBadge({
  isPromoActive,
  className,
}: {
  isPromoActive: boolean
  className?: string
}) {
  return (
    <Badge
      variant={isPromoActive ? "promo" : "retail"}
      size="xs"
      className={className}
    >
      {isPromoActive ? "Giá KM" : "Giá lẻ"}
    </Badge>
  )
}

/** Loại đơn vị (Gói lẻ, Thùng 30 gói…) — giỏ, checkout, cart line. */
export function ProductUnitLabelBadge({
  children,
  variant = "category",
  className,
}: {
  children: ReactNode
  variant?: NonNullable<VariantProps<typeof badgeVariants>["variant"]>
  className?: string
}) {
  return (
    <Badge variant={variant} size="xs" className={className}>
      {children}
    </Badge>
  )
}

/** Giá KM đã/không đủ SL trong giỏ. */
export function ProductCartPriceBadge({
  saleActive,
  className,
}: {
  saleActive: boolean
  className?: string
}) {
  return (
    <Badge
      variant={saleActive ? "promo" : "retail"}
      size="xs"
      className={className}
    >
      {saleActive ? "Giá KM (đủ SL)" : "Giá ban đầu"}
    </Badge>
  )
}

/** Badge % giảm trên ảnh SP. */
export function ProductDiscountBadge({
  percent,
  className,
}: {
  percent: number
  className?: string
}) {
  if (percent <= 0) return null
  return (
    <Badge variant="promo" size="xs" shape="pill" className={className}>
      -{percent}%
    </Badge>
  )
}

/** Trạng thái đơn API (`OrderStatus`) — admin + storefront. */
export function StoreOrderStatusBadge({
  status,
  label,
  className,
}: {
  status: OrderStatus
  label?: string
  className?: string
}) {
  const displayLabel = label ?? ORDER_STATUS_LABELS[status]

  return (
    <Badge
      variant={ORDER_STATUS_VARIANT[status]}
      size="sm"
      data-copy-text={displayLabel}
      className={className}
    >
      {displayLabel}
    </Badge>
  )
}

/** Trạng thái đơn trong bảng storefront (orders list). */
export function StoreOrderRowStatusBadge({
  status,
  icon: Icon,
  children,
  className,
}: {
  status: StoreOrderRowStatus
  icon?: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <Badge
      variant={STORE_ORDER_ROW_VARIANT[status]}
      size="sm"
      shape="pill"
      className={cn("gap-1.5", className)}
    >
      {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
      {children}
    </Badge>
  )
}

/** Trạng thái bật/tắt (sản phẩm, mã KM, …) — tonal success/muted, không dùng solid primary. */
export function ActiveStatusBadge({
  active,
  activeLabel = "Đang bán",
  inactiveLabel = "Ẩn",
  className,
}: {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}) {
  return (
    <Badge
      variant={active ? "success" : "muted"}
      size="sm"
      className={className}
    >
      {active ? activeLabel : inactiveLabel}
    </Badge>
  )
}

/** Số lượng trên icon giỏ hàng header. */
export function CartCountBadge({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  if (count <= 0) return null
  return (
    <Badge
      variant="default"
      size="xs"
      shape="pill"
      className={cn(
        "absolute flex min-w-4 items-center justify-center border-background px-1 font-bold tabular-nums",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  )
}
