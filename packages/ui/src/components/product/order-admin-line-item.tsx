"use client"

import type { OrderGiftSnapshot, OrderItem } from "@workspace/api-client"
import { Gift, Package2 } from "lucide-react"
import { Badge } from "../badge"
import { formatProductVnd } from "./product-money"
import { cn } from "../../lib/utils"

export type OrderAdminLineItemProps = {
  item: OrderItem
  className?: string
}

export function OrderAdminLineItem({ item, className }: OrderAdminLineItemProps) {
  const sku = item.variantSku ?? item.sku
  const unitLabel = item.unitLabel || item.unitType
  const hasDiscount =
    item.listUnitPrice != null && item.listUnitPrice > item.unitPrice

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-outline-variant/25 bg-muted/10 p-3 transition-colors hover:border-primary/15 hover:bg-muted/20",
        className,
      )}
    >
      {item.image ? (
        <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-outline-variant/20 bg-background">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-outline-variant/30 bg-muted/30 text-muted-foreground">
          <Package2 className="size-7 opacity-50" aria-hidden />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="font-semibold leading-snug text-foreground">{item.name}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="category" size="xs" className="font-mono">
            {sku}
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            {item.quantity.toLocaleString("vi-VN")} × {unitLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {hasDiscount ? (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatProductVnd(item.listUnitPrice!)}/đv
            </span>
          ) : null}
          <span className="text-base font-bold tabular-nums text-primary">
            {formatProductVnd(item.totalPrice)}
          </span>
        </div>
        {item.giftNote ? (
          <p className="rounded-md bg-primary/5 px-2 py-1.5 text-xs leading-snug text-primary">
            {item.giftNote}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export type OrderAdminGiftLineItemProps = {
  gift: OrderGiftSnapshot
  className?: string
}

export function OrderAdminGiftLineItem({
  gift,
  className,
}: OrderAdminGiftLineItemProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3",
        className,
      )}
    >
      {gift.image ? (
        <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-primary/20 bg-background">
          <img
            src={gift.image}
            alt={gift.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-background/80 text-primary">
          <Gift className="size-6" aria-hidden />
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="promo" size="xs">
            Quà tặng
          </Badge>
          <p className="font-semibold leading-snug">{gift.name}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {gift.label} · SL {gift.qty.toLocaleString("vi-VN")}
          {gift.sku ? ` · ${gift.sku}` : ""}
        </p>
      </div>
    </div>
  )
}
