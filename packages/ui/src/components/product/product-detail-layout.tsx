"use client"

import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export type ProductDetailLayoutProps = {
  gallery: ReactNode
  details: ReactNode
  footer?: ReactNode
  className?: string
}

/** Bố cục 2 cột chuẩn — gallery trái (sticky), thông tin phải. */
export function ProductDetailLayout({
  gallery,
  details,
  footer,
  className,
}: ProductDetailLayoutProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 items-start gap-5 pt-3 lg:grid-cols-2 lg:gap-6 lg:pt-4">
        <div className="lg:sticky lg:top-6">{gallery}</div>
        <div className="space-y-4">{details}</div>
      </div>
      {footer ? <div className="border-t border-outline-variant/30 pt-2">{footer}</div> : null}
    </div>
  )
}
