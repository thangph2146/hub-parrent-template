"use client"

import type { ReactNode } from "react"
import { ProductPriceTierBadge, ProductStockBadge } from "../badge-presets"
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
  /** Thẻ catalog hẹp — giá và stepper xếp dọc. */
  stacked?: boolean
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
  stacked = false,
  className,
}: ProductDetailOrderRowProps) {
  const showEquivalent =
    equivalentTotal != null &&
    equivalentUnit != null &&
    (equivalentTotal !== qty || equivalentUnit !== unitType)

  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant/20 bg-muted/15",
        stacked ? "p-3" : "border-outline-variant/25 bg-background/70 p-4 shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          stacked
            ? "grid gap-2.5"
            : "grid gap-5 sm:grid-cols-[minmax(0,1fr)_11.5rem] sm:items-center sm:gap-6"
        )}
      >
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <p className="text-[11px] font-medium text-muted-foreground">
                Đơn giá
              </p>
              {hasWholesale && !stacked ? (
                <ProductPriceTierBadge isPromoActive={listPrice != null} />
              ) : null}
            </div>
            {stacked && stockCount != null ? (
              <ProductStockBadge
                count={stockCount}
                status={stockStatus}
                className="shrink-0"
              />
            ) : null}
          </div>

          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            {listPrice != null ? (
              <p className="text-xs font-medium text-muted-foreground line-through tabular-nums">
                {formatProductVnd(listPrice)}
              </p>
            ) : null}
            <p
              className={cn(
                "font-black leading-none tracking-tight text-primary tabular-nums",
                stacked ? "text-xl" : "text-[1.625rem] sm:text-[1.75rem]"
              )}
            >
              {formatProductVnd(unitPrice)}
            </p>
            <p className="text-xs text-muted-foreground">/ {unitLabel}</p>
            {stacked && hasWholesale ? (
              <ProductPriceTierBadge
                isPromoActive={listPrice != null}
                className="mb-0.5"
              />
            ) : null}
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
          onQtyChange={(next) => {
            const capped =
              maxQty != null
                ? maxQty <= 0
                  ? Math.max(0, Math.min(next, 0))
                  : Math.max(minQty, Math.min(next, maxQty))
                : Math.max(minQty, next)
            onQtyChange(capped)
          }}
          minQty={minQty}
          maxQty={maxQty}
          stockCount={stacked ? undefined : stockCount}
          stockStatus={stockStatus}
          layout="embedded"
          unitInline
          showLabel={false}
          compact={stacked}
        />
      </div>

      {footer ? (
        <div
          className={cn(
            "border-t border-outline-variant/15",
            stacked ? "mt-2.5 space-y-2 pt-2.5" : "mt-3 pt-3"
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}
