"use client"

import type { ComponentProps, ReactNode } from "react"
import { Button } from "../button"
import { cn } from "../../lib/utils"

/** Meta chuẩn cho cột hành động (ẩn filter, loại khỏi export). */
export const TABLE_ACTIONS_COLUMN_META = {
  disableColumnFilter: true,
  excludeFromExport: true,
} as const

const defaultActionButtonClass = "h-8 gap-1.5"

export type DataTableRowActionItem = {
  key: string
  label: string
  onClick: () => void
  icon?: ReactNode
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
  disabled?: boolean
  title?: string
  className?: string
  hidden?: boolean
}

export function DataTableRowActions({
  actions,
  children,
  className,
}: {
  actions?: DataTableRowActionItem[]
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {actions
        ? actions
            .filter((action) => !action.hidden)
            .map((action) => (
              <DataTableRowActionButton
                key={action.key}
                label={action.label}
                onClick={action.onClick}
                icon={action.icon}
                variant={action.variant}
                size={action.size}
                disabled={action.disabled}
                title={action.title}
                className={action.className}
              />
            ))
        : children}
    </div>
  )
}

export function DataTableRowActionButton({
  label,
  onClick,
  icon,
  variant = "outline",
  size = "sm",
  disabled,
  title,
  className,
}: {
  label: string
  onClick: () => void
  icon?: ReactNode
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
  disabled?: boolean
  title?: string
  className?: string
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(defaultActionButtonClass, className)}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon ? (
        <span className="inline-flex shrink-0 [&>svg]:size-3.5" aria-hidden>
          {icon}
        </span>
      ) : null}
      {label}
    </Button>
  )
}
