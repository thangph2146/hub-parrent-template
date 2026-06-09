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
  "Tồn kho": Warehouse,
}

export function ProductDetailMetaGrid({
  items,
  className,
}: {
  items: readonly ProductDetailMetaItem[]
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map((item) => {
        const Icon = item.icon ?? labelIcons[item.label] ?? Package
        return (
          <div
            key={item.label}
            className="rounded-xl border border-outline-variant/40 bg-background p-3.5 transition-colors hover:border-primary/25 hover:bg-muted/20"
          >
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm font-bold">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0 truncate">{item.value}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}
