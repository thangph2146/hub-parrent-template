"use client"

import type { ReactNode } from "react"
import { Tag } from "lucide-react"
import { Badge } from "../badge"
import { cn } from "../../lib/utils"

export type ProductDetailInfoHeaderProps = {
  categoryLabel: string
  title: string
  description?: string | null
  subtitle?: ReactNode
  couponBadges?: readonly string[]
  extraBadges?: ReactNode
  className?: string
}

export function ProductDetailInfoHeader({
  categoryLabel,
  title,
  description,
  subtitle,
  couponBadges = [],
  extraBadges,
  className,
}: ProductDetailInfoHeaderProps) {
  return (
    <header
      className={cn(
        "space-y-2.5 border-b border-outline-variant/25 pb-4",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="category" size="sm">
          {categoryLabel}
        </Badge>
        {couponBadges.map((coupon) => (
          <Badge key={coupon} variant="coupon" size="sm">
            <Tag aria-hidden />
            {coupon}
          </Badge>
        ))}
        {extraBadges}
      </div>

      <div className="space-y-1">
        <h1 className="text-[1.375rem] leading-snug font-black tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>

      {description ? (
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground/90">
          {description}
        </p>
      ) : null}
    </header>
  )
}
