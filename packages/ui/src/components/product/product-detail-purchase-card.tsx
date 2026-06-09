"use client"

import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export type ProductDetailPurchaseCardProps = {
  children: ReactNode
  className?: string
}

/** Khối mua hàng — chọn đơn vị, giá, số lượng. */
export function ProductDetailPurchaseCard({
  children,
  className,
}: ProductDetailPurchaseCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-outline-variant/30 bg-card shadow-md ring-1 ring-black/[0.03] dark:ring-white/[0.04]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ProductDetailPurchaseCardSection({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode
  className?: string
  /** `order` — vùng giá + số lượng, nền nhẹ. */
  variant?: "default" | "order" | "muted"
}) {
  return (
    <div
      className={cn(
        "border-t border-outline-variant/25 p-4 first:border-t-0",
        variant === "order" &&
          "bg-gradient-to-br from-primary/[0.03] via-background to-muted/20",
        variant === "muted" && "bg-muted/15",
        className
      )}
    >
      {children}
    </div>
  )
}
