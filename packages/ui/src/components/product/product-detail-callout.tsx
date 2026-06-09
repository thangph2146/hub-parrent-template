"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export type ProductDetailCalloutTone = "success" | "warning" | "info"

const toneClass: Record<ProductDetailCalloutTone, string> = {
  success:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  warning:
    "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-200",
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
        "rounded-xl border px-3.5 py-3 text-sm shadow-sm",
        toneClass[tone],
        className
      )}
    >
      <p className="flex items-center gap-2 font-semibold">
        {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
        {title}
      </p>
      {children ? <div className="mt-1.5 leading-relaxed">{children}</div> : null}
    </div>
  )
}
