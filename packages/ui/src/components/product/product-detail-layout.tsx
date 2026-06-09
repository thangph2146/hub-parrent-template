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
    <div className={cn("space-y-8", className)}>
      <div className="grid grid-cols-1 items-start gap-4 pt-4 lg:grid-cols-2 lg:pt-6">
        <div className="lg:sticky lg:top-6">{gallery}</div>
        <div className="space-y-6">{details}</div>
      </div>
      {footer ? <div className="border-t border-outline-variant/30 pt-2">{footer}</div> : null}
    </div>
  )
}
