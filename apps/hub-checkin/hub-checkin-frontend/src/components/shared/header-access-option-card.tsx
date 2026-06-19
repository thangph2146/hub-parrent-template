"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { cn } from "@ui/lib/utils"
import type { HeaderActionTileVariant } from "@/components/shared/header-action-tile"

const ICON_STRIP: Record<HeaderActionTileVariant, string> = {
  portal: "bg-muted text-primary",
  staff:
    "bg-gradient-to-br from-brand-navy to-brand-navy/85 text-white shadow-sm shadow-brand-navy/15",
}

export type HeaderAccessOptionCardProps = {
  href: string
  icon: LucideIcon
  title: string
  subtitle: string
  variant: HeaderActionTileVariant
  ariaLabel: string
  showStatusDot?: boolean
  onClick?: () => void
  className?: string
}

/** Hàng chọn cổng — dùng trong sheet menu mobile. */
export function HeaderAccessOptionCard({
  href,
  icon: Icon,
  title,
  subtitle,
  variant,
  ariaLabel,
  showStatusDot = false,
  onClick,
  className,
}: HeaderAccessOptionCardProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-left transition-colors",
        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        variant === "staff" && "border-brand-navy/20 bg-brand-navy/[0.04]",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-lg",
          ICON_STRIP[variant],
        )}
      >
        <Icon className="size-4" aria-hidden />
        {showStatusDot ? (
          <span
            className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border-2 border-background bg-emerald-500"
            aria-hidden
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground/60"
        aria-hidden
      />
    </Link>
  )
}
