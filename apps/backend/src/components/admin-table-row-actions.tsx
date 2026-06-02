"use client"

import type { ReactNode } from "react"
import { ArchiveRestore, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"

/** Meta chuẩn cho cột Thao tác (theo DataTable storefront). */
export const ADMIN_TABLE_ACTIONS_COLUMN_META = {
  disableColumnFilter: true,
  excludeFromExport: true,
} as const

const actionButtonClass = "h-8 gap-1.5"

type ActionButtonProps = {
  onClick: () => void
  disabled?: boolean
  title?: string
  label?: string
}

export function AdminTableRowActions({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  )
}

export function AdminTableViewButton({
  onClick,
  label = "Xem",
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      className={actionButtonClass}
      onClick={onClick}
    >
      <Eye className="size-3.5" aria-hidden />
      {label}
    </Button>
  )
}

export function AdminTableEditButton({
  onClick,
  disabled,
  title,
  label = "Sửa",
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={actionButtonClass}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Pencil className="size-3.5" aria-hidden />
      {label}
    </Button>
  )
}

export function AdminTableSoftDeleteButton({
  onClick,
  disabled,
  title,
  label = "Xóa tạm",
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className={actionButtonClass}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Trash2 className="size-3.5" aria-hidden />
      {label}
    </Button>
  )
}

export function AdminTablePurgeButton({
  onClick,
  disabled,
  title = "Xóa vĩnh viễn khỏi cơ sở dữ liệu",
  label = "Xóa vĩnh viễn",
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className={actionButtonClass}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Trash2 className="size-3.5" aria-hidden />
      {label}
    </Button>
  )
}

export function AdminTableRestoreButton({
  onClick,
  disabled,
  title,
  label = "Khôi phục",
}: ActionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={actionButtonClass}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <ArchiveRestore className="size-3.5" aria-hidden />
      {label}
    </Button>
  )
}

type AdminTableCrudRowActionsProps = {
  canWrite: boolean
  onView: () => void
  onEdit?: () => void
  onSoftDelete?: () => void
  onPurge?: () => void
  softDeleteDisabled?: boolean
  softDeleteTitle?: string
  purgeDisabled?: boolean
  purgeTitle?: string
}

/** Hàng thao tác danh sách chính: Xem / Sửa / Xóa tạm / Xóa vĩnh viễn. */
export function AdminTableCrudRowActions({
  canWrite,
  onView,
  onEdit,
  onSoftDelete,
  onPurge,
  softDeleteDisabled,
  softDeleteTitle,
  purgeDisabled,
  purgeTitle,
}: AdminTableCrudRowActionsProps) {
  return (
    <AdminTableRowActions>
      <AdminTableViewButton onClick={onView} />
      {canWrite && onEdit ? <AdminTableEditButton onClick={onEdit} /> : null}
      {canWrite && onSoftDelete ? (
        <AdminTableSoftDeleteButton
          onClick={onSoftDelete}
          disabled={softDeleteDisabled}
          title={softDeleteTitle}
        />
      ) : null}
      {canWrite && onPurge ? (
        <AdminTablePurgeButton
          onClick={onPurge}
          disabled={purgeDisabled}
          title={purgeTitle}
        />
      ) : null}
    </AdminTableRowActions>
  )
}

type AdminTableTrashRowActionsProps = {
  canWrite: boolean
  onRestore: () => void
  onPurge: () => void
  disabled?: boolean
}

/** Hàng thao tác thùng rác: Khôi phục / Xóa vĩnh viễn. */
export function AdminTableTrashRowActions({
  canWrite,
  onRestore,
  onPurge,
  disabled,
}: AdminTableTrashRowActionsProps) {
  if (!canWrite) return null

  return (
    <AdminTableRowActions>
      <AdminTableRestoreButton onClick={onRestore} disabled={disabled} />
      <AdminTablePurgeButton onClick={onPurge} disabled={disabled} />
    </AdminTableRowActions>
  )
}
