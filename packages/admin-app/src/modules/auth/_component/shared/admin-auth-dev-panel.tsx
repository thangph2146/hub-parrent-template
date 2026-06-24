"use client"

import type { ReactNode } from "react"

import { Code2 } from "lucide-react"

import { cn } from "@ui/lib/utils"

export type AdminAuthDevPanelProps = {
  children: ReactNode
  description: string
  className?: string
}

export function AdminAuthDevPanel({
  children,
  description,
  className,
}: AdminAuthDevPanelProps) {
  return (
    <div
      className={cn(
        "space-y-2.5 rounded-xl border border-dashed border-amber-500/35 bg-amber-500/[0.05] px-3.5 py-3 dark:bg-amber-950/15",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
          <Code2 className="size-3" aria-hidden />
          Development
        </span>
      </div>
      {children}
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}
