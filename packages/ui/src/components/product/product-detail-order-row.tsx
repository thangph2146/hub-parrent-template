"use client"

import type { ReactNode } from "react"
import { Badge } from "../badge"
import { formatProductVnd } from "./product-money"
import {
  ProductDetailQtyStepper,
  type ProductDetailQtyStockStatus,
} from "./product-detail-qty-stepper"
import { cn } from "../../lib/utils"

export type ProductDetailOrderRowProps = {
  unitPrice: number
  listPrice?: number | null
  unitLabel: string
  hasWholesale?: boolean
  qty: number
  unitType: string
  onQtyChange: (qty: number) => void
  minQty?: number
  maxQty?: number
  stockCount?: number
  stockStatus?: ProductDetailQtyStockStatus
  equivalentTotal?: number
  equivalentUnit?: string
  footer?: ReactNode
  className?: string
}

export function ProductDetailOrderRow({
  unitPrice,
  listPrice = null,
  unitLabel,
  hasWholesale = false,
  qty,
  unitType,
  onQtyChange,
  minQty = 1,
  maxQty,
  stockCount,
  stockStatus = "ok",
  equivalentTotal,
  equivalentUnit,
  footer,
  className,
}: ProductDetailOrderRowProps) {
  const showEquivalent =
    equivalentTotal != null &&
    equivalentUnit != null &&
    (equivalentTotal !== qty || equivalentUnit !== unitType)

  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/25 bg-background/70 p-4 shadow-sm",
        className
      )}
    >
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_11.5rem] sm:items-center sm:gap-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">Đơn giá</p>
            {hasWholesale ? (
              <Badge
                variant={listPrice != null ? "promo" : "retail"}
                size="xs"
              >
                {listPrice != null ? "Giá KM" : "Giá lẻ"}
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {listPrice != null ? (
              <p className="text-sm font-medium text-muted-foreground line-through tabular-nums">
                {formatProductVnd(listPrice)}
              </p>
            ) : null}
            <p className="text-[1.625rem] font-black leading-none tracking-tight text-primary tabular-nums sm:text-[1.75rem]">
              {formatProductVnd(unitPrice)}
            </p>
            <p className="text-sm text-muted-foreground">/ {unitLabel}</p>
          </div>

          {showEquivalent ? (
            <p className="text-[11px] text-muted-foreground">
              Quy đổi{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {equivalentTotal!.toLocaleString("vi-VN")}
              </span>{" "}
              {equivalentUnit}
            </p>
          ) : null}
        </div>

        <ProductDetailQtyStepper
          qty={qty}
          unitType={unitType}
          onQtyChange={onQtyChange}
          minQty={minQty}
          maxQty={maxQty}
          stockCount={stockCount}
          stockStatus={stockStatus}
          layout="embedded"
          unitInline
        />
      </div>

      {footer ? <div className="mt-3 border-t border-outline-variant/20 pt-3">{footer}</div> : null}
    </div>
  )
}
