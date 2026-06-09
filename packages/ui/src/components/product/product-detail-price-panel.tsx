"use client"

import type { ReactNode } from "react"
import { ProductPriceTierBadge } from "../badge-presets"
import { formatProductVnd } from "./product-money"
import { cn } from "../../lib/utils"

export type ProductDetailPricePanelProps = {
  unitPrice: number
  listPrice?: number | null
  unitLabel: string
  hasWholesale?: boolean
  totalLabel?: string | null
  totalPrice?: number | null
  children?: ReactNode
  className?: string
  compact?: boolean
  showTotal?: boolean
}

export function ProductDetailPricePanel({
  unitPrice,
  listPrice = null,
  unitLabel,
  hasWholesale = false,
  totalLabel,
  totalPrice,
  children,
  className,
  compact = false,
  showTotal = true,
}: ProductDetailPricePanelProps) {
  return (
    <div
      className={cn(
        compact ? "min-w-0 space-y-1.5" : "space-y-3 rounded-xl border border-outline-variant/40 bg-muted/15 p-4 shadow-sm",
        className
      )}
    >
      {compact ? (
        <p className="text-[11px] font-medium text-muted-foreground">Đơn giá</p>
      ) : null}

      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        {listPrice != null ? (
          <p className="pb-0.5 text-sm font-medium text-muted-foreground line-through tabular-nums">
            {formatProductVnd(listPrice)}
          </p>
        ) : null}
        <p
          className={cn(
            "font-black leading-none tracking-tight text-primary tabular-nums",
            compact ? "text-[1.75rem]" : "text-3xl"
          )}
        >
          {formatProductVnd(unitPrice)}
        </p>
        <p className="pb-0.5 text-sm text-muted-foreground">/ {unitLabel}</p>
        {hasWholesale ? (
          <ProductPriceTierBadge
            isPromoActive={listPrice != null}
            className="mb-0.5"
          />
        ) : null}
      </div>

      {children}

      {showTotal && totalPrice != null && totalPrice > 0 && totalLabel ? (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border border-outline-variant/25 bg-background/80",
            compact ? "px-2.5 py-2" : "px-3 py-2.5"
          )}
        >
          <p className="text-xs font-medium text-muted-foreground">
            {totalLabel}
          </p>
          <p
            className={cn(
              "font-black text-primary tabular-nums",
              compact ? "text-lg" : "text-xl"
            )}
          >
            {formatProductVnd(totalPrice)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
