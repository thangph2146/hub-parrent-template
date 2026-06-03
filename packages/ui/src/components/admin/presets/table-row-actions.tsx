"use client"

import { ArchiveRestore, Eye, Pencil, Trash2 } from "lucide-react"
import {
  DataTableRowActionButton,
  DataTableRowActions,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionItem,
} from "../../data-table"

/** @deprecated Dùng `TABLE_ACTIONS_COLUMN_META` từ `@ui/components/data-table`. */
export const ADMIN_TABLE_ACTIONS_COLUMN_META = TABLE_ACTIONS_COLUMN_META

export { DataTableRowActions as AdminTableRowActions }

type ActionButtonProps = {
  label?: string
  onClick: () => void
  disabled?: boolean
  title?: string
}

export function AdminTableViewButton({
  label = "Xem",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="default"
      icon={<Eye />}
    />
  )
}

export function AdminTableEditButton({
  label = "Sửa",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="outline"
      icon={<Pencil />}
    />
  )
}

export function AdminTableSoftDeleteButton({
  label = "Xóa tạm",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="destructive"
      icon={<Trash2 />}
    />
  )
}

export function AdminTablePurgeButton({
  label = "Xóa vĩnh viễn",
  title = "Xóa vĩnh viễn khỏi cơ sở dữ liệu",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      title={title}
      variant="destructive"
      icon={<Trash2 />}
    />
  )
}

export function AdminTableRestoreButton({
  label = "Khôi phục",
  ...props
}: ActionButtonProps) {
  return (
    <DataTableRowActionButton
      {...props}
      label={label}
      variant="outline"
      icon={<ArchiveRestore />}
    />
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
  labels?: {
    view?: string
    edit?: string
    softDelete?: string
    purge?: string
  }
}

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
  labels,
}: AdminTableCrudRowActionsProps) {
  const actions: DataTableRowActionItem[] = [
    {
      key: "view",
      label: labels?.view ?? "Xem",
      onClick: onView,
      icon: <Eye />,
      variant: "default",
    },
  ]

  if (canWrite && onEdit) {
    actions.push({
      key: "edit",
      label: labels?.edit ?? "Sửa",
      onClick: onEdit,
      icon: <Pencil />,
      variant: "outline",
    })
  }

  if (canWrite && onSoftDelete) {
    actions.push({
      key: "soft-delete",
      label: labels?.softDelete ?? "Xóa tạm",
      onClick: onSoftDelete,
      icon: <Trash2 />,
      variant: "destructive",
      disabled: softDeleteDisabled,
      title: softDeleteTitle,
    })
  }

  if (canWrite && onPurge) {
    actions.push({
      key: "purge",
      label: labels?.purge ?? "Xóa vĩnh viễn",
      onClick: onPurge,
      icon: <Trash2 />,
      variant: "destructive",
      disabled: purgeDisabled,
      title: purgeTitle,
    })
  }

  return <DataTableRowActions actions={actions} />
}

type AdminTableTrashRowActionsProps = {
  canWrite: boolean
  onRestore: () => void
  onPurge: () => void
  disabled?: boolean
  labels?: {
    restore?: string
    purge?: string
  }
}

export function AdminTableTrashRowActions({
  canWrite,
  onRestore,
  onPurge,
  disabled,
  labels,
}: AdminTableTrashRowActionsProps) {
  if (!canWrite) return null

  const actions: DataTableRowActionItem[] = [
    {
      key: "restore",
      label: labels?.restore ?? "Khôi phục",
      onClick: onRestore,
      icon: <ArchiveRestore />,
      variant: "outline",
      disabled,
    },
    {
      key: "purge",
      label: labels?.purge ?? "Xóa vĩnh viễn",
      onClick: onPurge,
      icon: <Trash2 />,
      variant: "destructive",
      disabled,
      title: "Xóa vĩnh viễn khỏi cơ sở dữ liệu",
    },
  ]

  return <DataTableRowActions actions={actions} />
}
