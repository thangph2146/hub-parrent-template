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
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-primary/20 bg-primary/10 px-3 py-1 font-bold text-primary">
          {categoryLabel}
        </Badge>
        {couponBadges.map((coupon) => (
          <Badge
            key={coupon}
            className="border-destructive/20 bg-destructive/10 text-xs font-bold text-destructive"
          >
            <Tag className="mr-1 size-3" aria-hidden />
            {coupon}
          </Badge>
        ))}
        {extraBadges}
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl leading-[1.15] font-black tracking-tight text-foreground sm:text-[2rem]">
          {title}
        </h1>
        {subtitle ? (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>

      {description ? (
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
