"use client"

import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export function ProductDetailSectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "text-xs font-bold tracking-wide text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </p>
  )
}
