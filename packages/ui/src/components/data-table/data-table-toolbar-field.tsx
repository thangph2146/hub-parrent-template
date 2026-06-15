"use client"

import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

const TOOLBAR_FIELD_LABEL_CLASS = "text-xs font-medium text-muted-foreground"

export function DataTableToolbarField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className={TOOLBAR_FIELD_LABEL_CLASS}>
        {label}
      </label>
      {children}
    </div>
  )
}
