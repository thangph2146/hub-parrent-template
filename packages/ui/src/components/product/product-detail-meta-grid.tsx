"use client"

import type { LucideIcon } from "lucide-react"
import { Barcode, Globe2, Package, Warehouse } from "lucide-react"
import { cn } from "../../lib/utils"

export type ProductDetailMetaItem = {
  label: string
  value: string
  icon?: LucideIcon
}

const labelIcons: Record<string, LucideIcon> = {
  "Thương hiệu": Package,
  "Xuất xứ": Globe2,
  "Mã SKU": Barcode,
  SKU: Barcode,
  "Tồn kho": Warehouse,
  Tồn: Warehouse,
}

export function ProductDetailMetaGrid({
  items,
  className,
  compact = false,
}: {
  items: readonly ProductDetailMetaItem[]
  className?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-2 sm:grid-cols-3",
          className
        )}
      >
        {items.map((item) => {
          const Icon = item.icon ?? labelIcons[item.label] ?? Package
          return (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-xl border border-outline-variant/25 bg-muted/15 px-3 py-2"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {items.map((item) => {
        const Icon = item.icon ?? labelIcons[item.label] ?? Package
        return (
          <div
            key={item.label}
            className="rounded-lg border border-outline-variant/40 bg-background p-2.5 transition-colors hover:border-primary/25 hover:bg-muted/20"
          >
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-bold">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-3" aria-hidden />
              </span>
              <span className="min-w-0 truncate">{item.value}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}
