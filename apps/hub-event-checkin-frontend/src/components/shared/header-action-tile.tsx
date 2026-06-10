"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@ui/lib/utils"

export type HeaderActionTileVariant = "portal" | "staff"

const STRIP_VARIANT: Record<HeaderActionTileVariant, string> = {
  portal:
    "bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground",
  staff:
    "bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/85 text-white",
}

export type HeaderActionTileProps = {
  href: string
  icon: LucideIcon
  title: string
  subtitle?: string
  variant: HeaderActionTileVariant
  ariaLabel: string
  inMenu?: boolean
  showStatusDot?: boolean
}

export function HeaderActionTile({
  href,
  icon: Icon,
  title,
  subtitle,
  variant,
  ariaLabel,
  inMenu = false,
  showStatusDot = false,
}: HeaderActionTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0",
        inMenu ? "w-full" : undefined,
      )}
      aria-label={ariaLabel}
    >
      <span
        className={cn(
          "group/tile inline-flex items-stretch overflow-hidden rounded-xl border border-border/80 bg-card text-left shadow-sm transition-all duration-200",
          "hover:-translate-y-px hover:border-primary/35 hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          inMenu ? "h-11 w-full" : "h-9",
        )}
      >
        <span
          className={cn(
            "relative flex w-9 shrink-0 items-center justify-center",
            STRIP_VARIANT[variant],
          )}
        >
          <Icon className="relative size-4" aria-hidden />
          {showStatusDot ? (
            <span
              className="absolute right-1 top-1 size-1.5 rounded-full bg-emerald-400 ring-2 ring-white/90"
              aria-hidden
            />
          ) : null}
        </span>
        <span
          className={cn(
            "flex min-w-0 items-center border-l border-border/70 px-3",
            inMenu ? "flex-1" : "hidden sm:flex",
          )}
        >
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-semibold text-foreground">
              {title}
            </span>
            {subtitle ? (
              <span className="mt-0.5 truncate text-[10px] font-medium text-muted-foreground">
                {subtitle}
              </span>
            ) : null}
          </span>
        </span>
      </span>
    </Link>
  )
}
