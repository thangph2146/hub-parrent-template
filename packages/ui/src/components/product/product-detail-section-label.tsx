"use client"

import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export function ProductDetailSectionLabel({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode
  className?: string
  variant?: "default" | "soft"
}) {
  return (
    <p
      className={cn(
        variant === "soft"
          ? "text-xs font-semibold text-muted-foreground"
          : "text-xs font-bold tracking-wide text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </p>
  )
}
