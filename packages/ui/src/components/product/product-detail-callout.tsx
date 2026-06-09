"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export type ProductDetailCalloutTone = "success" | "warning" | "info"

const toneClass: Record<ProductDetailCalloutTone, string> = {
  success:
    "border-success/30 bg-success/10 text-success dark:bg-success/15",
  warning:
    "border-warning/30 bg-warning/10 text-warning dark:bg-warning/15",
  info: "border-primary/25 bg-primary/5 text-foreground",
}

export type ProductDetailCalloutProps = {
  tone?: ProductDetailCalloutTone
  icon?: LucideIcon
  title: ReactNode
  children?: ReactNode
  className?: string
}

export function ProductDetailCallout({
  tone = "info",
  icon: Icon,
  title,
  children,
  className,
}: ProductDetailCalloutProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-xs shadow-sm",
        toneClass[tone],
        className
      )}
    >
      <p className="flex items-center gap-1.5 font-semibold">
        {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
        {title}
      </p>
      {children ? <div className="mt-1 leading-relaxed">{children}</div> : null}
    </div>
  )
}
