"use client"

import { Pencil, Trash2 } from "lucide-react"
import {
  DataTableRowActionsMenu,
  TABLE_ACTIONS_COLUMN_META,
  type DataTableRowActionItem,
} from "@ui/components/data-table"
import type { HanetPlaceOption } from "../shared/hanet-place-parse"

export type HanetPlaceRowActionsProps = {
  place: HanetPlaceOption
  canWrite: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function HanetPlaceRowActions({
  place,
  canWrite,
  onEdit,
  onDelete,
}: HanetPlaceRowActionsProps) {
  const actions: DataTableRowActionItem[] = []

  if (canWrite && onEdit) {
    actions.push({
      key: "edit",
      label: "Sửa địa điểm",
      hint: "Cập nhật tên và địa chỉ trên HANET",
      onClick: onEdit,
      icon: <Pencil />,
      group: "primary",
    })
  }

  if (canWrite && onDelete) {
    actions.push({
      key: "delete",
      label: "Xóa địa điểm",
      hint: "Gỡ place khỏi HANET và app partner",
      onClick: onDelete,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
    })
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      autoConfirmDangerousActions={false}
      triggerLabel={`Thao tác địa điểm ${place.name || place.placeId}`}
      groups={{
        primary: { label: "Thao tác", sublabel: false },
        danger: { label: "Xóa", sublabel: true },
      }}
    />
  )
}

export const hanetPlaceActionsColumnMeta = {
  ...TABLE_ACTIONS_COLUMN_META,
  className: `${TABLE_ACTIONS_COLUMN_META.className} sticky right-0 z-[10]`,
}
