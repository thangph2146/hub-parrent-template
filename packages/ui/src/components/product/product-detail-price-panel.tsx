"use client"

import type { ReactNode } from "react"
import { Badge } from "../badge"
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
}: ProductDetailPricePanelProps) {
  return (
    <div
      className={cn(
        "bg-surface space-y-3.5 rounded-2xl border border-outline-variant/40 bg-gradient-to-br from-background via-background to-muted/20 p-5 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-end gap-2 md:gap-3">
        {listPrice != null ? (
          <p className="mb-1 text-lg font-semibold text-muted-foreground line-through tabular-nums">
            {formatProductVnd(listPrice)}
          </p>
        ) : null}
        <p className="text-4xl font-black tracking-tight text-primary tabular-nums">
          {formatProductVnd(unitPrice)}
        </p>
        <p className="mb-1 text-base text-muted-foreground">/ {unitLabel}</p>
        {hasWholesale ? (
          <Badge
            className={
              listPrice != null
                ? "mb-1 border-primary/20 bg-primary/10 font-bold text-primary"
                : "mb-1 border-secondary/20 bg-secondary/10 font-bold text-secondary-foreground"
            }
          >
            {listPrice != null ? "Giá KM (đủ SL)" : "Giá ban đầu"}
          </Badge>
        ) : null}
      </div>

      {children}

      {totalPrice != null && totalPrice > 0 && totalLabel ? (
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/25 bg-background/60 px-3 py-2.5">
          <p className="text-sm font-medium text-muted-foreground">
            {totalLabel}
          </p>
          <p className="text-xl font-black text-primary tabular-nums">
            {formatProductVnd(totalPrice)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
