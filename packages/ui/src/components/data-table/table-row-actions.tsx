"use client"

import type { ComponentProps, ReactNode } from "react"
import { Button } from "../button"
import { cn } from "../../lib/utils"
import type { DataTableRowActionConfirm } from "./row-action-confirm"
import { useRowActionConfirm } from "./row-action-confirm"
import { useRegisterDataTableRowActions } from "./data-table-row-actions-registry"
import { getDisplayableRowActions } from "./row-actions-menu-shared"

/** Id mặc định cột thao tác — DataTable tự gộp meta khi khớp id này. */
export const DATA_TABLE_ACTIONS_COLUMN_ID = "actions"

/** Nút ⋯ cột thao tác — kích thước cố định, variant outline mặc định. */
export const DATA_TABLE_ROW_ACTIONS_TRIGGER_CLASS = "size-8 shrink-0 p-0"

/** Meta chuẩn cho cột hành động (ẩn filter, loại khỏi export, căn giữa menu ⋯). */
export const TABLE_ACTIONS_COLUMN_META = {
  disableColumnFilter: true,
  excludeFromExport: true,
  isActionsColumn: true,
  className:
    "w-[72px] min-w-[72px] max-w-[80px] px-1 text-center align-middle [&>div]:flex [&>div]:w-full [&>div]:justify-center",
} as const

const defaultActionButtonClass = "h-8 gap-1.5"

export type DataTableRowActionGroupId = "primary" | "status" | "danger"

export type DataTableRowActionItem = {
  key: string
  label: string
  onClick: () => void | Promise<void>
  icon?: ReactNode
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
  /** Không hiển thị trong menu ⋯ / chuột phải (cùng hiệu lực với `hidden`). */
  disabled?: boolean
  title?: string
  className?: string
  /** Ẩn hoàn toàn — dùng khi không đủ quyền. */
  hidden?: boolean
  /** Nhóm trong menu dropdown (mặc định: primary). */
  group?: DataTableRowActionGroupId
  /** Gợi ý phụ dưới nhãn trong menu. */
  hint?: string
  iconBgClassName?: string
  iconClassName?: string
  menuVariant?: "default" | "destructive"
  /**
   * Dialog xác nhận trước khi gọi `onClick`.
   * `false` = tắt; không khai báo = menu tự bật với thao tác danger/toggle (xem `autoConfirmDangerousActions`).
   */
  confirm?: DataTableRowActionConfirm | false
}

export function DataTableRowActions({
  actions,
  children,
  className,
  autoConfirmDangerousActions = true,
}: {
  actions?: DataTableRowActionItem[]
  children?: ReactNode
  className?: string
  autoConfirmDangerousActions?: boolean
}) {
  const { runAction, confirmDialog } = useRowActionConfirm(
    autoConfirmDangerousActions
  )

  const displayableActions = actions ? getDisplayableRowActions(actions) : null

  useRegisterDataTableRowActions(
    displayableActions
      ? {
          actions: displayableActions,
          autoConfirmDangerousActions,
        }
      : null
  )

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {displayableActions
          ? displayableActions.map((action) => (
                <DataTableRowActionButton
                  key={action.key}
                  label={action.label}
                  onClick={() => runAction(action)}
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
      {confirmDialog}
    </>
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
  onClick: () => void | Promise<void>
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
