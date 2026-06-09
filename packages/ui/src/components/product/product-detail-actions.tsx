"use client"

import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export type ProductDetailActionsProps = {
  primary: ReactNode
  secondary?: ReactNode
  trust?: ReactNode
  className?: string
}

/** Hàng CTA + thông tin giao hàng / tin cậy. */
export function ProductDetailActions({
  primary,
  secondary,
  trust,
  className,
}: ProductDetailActionsProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-outline-variant/25 bg-muted/10 p-3.5",
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">{primary}</div>
        {secondary ? (
          <div className="shrink-0 sm:w-auto">{secondary}</div>
        ) : null}
      </div>
      {trust ? (
        <div className="flex items-center justify-center border-t border-outline-variant/20 pt-2.5 sm:justify-start">
          {trust}
        </div>
      ) : null}
    </div>
  )
}
