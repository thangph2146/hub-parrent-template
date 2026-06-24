"use client"

import { CalendarDays } from "lucide-react"

import { cn } from "@ui/lib/utils"

export type AdminAuthFormHeaderProps = {
  title: string
  siteName: string
  siteDescription?: string | null
  className?: string
}

/** Header gọn cho cột form split-screen — căn trái, khớp typography admin. */
export function AdminAuthFormHeader({
  title,
  siteName,
  siteDescription,
  className,
}: AdminAuthFormHeaderProps) {
  return (
    <header className={cn("mb-8 space-y-4", className)}>
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-primary/15">
        <CalendarDays className="size-6" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary/80">
          {siteName}
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {siteDescription ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {siteDescription}
          </p>
        ) : null}
      </div>
    </header>
  )
}
