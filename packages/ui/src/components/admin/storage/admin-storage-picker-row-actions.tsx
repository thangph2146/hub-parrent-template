"use client"

import { Check, ExternalLink, Settings2, Trash2, X } from "lucide-react"
import {
  DataTableRowActionsMenu,
  type DataTableRowActionItem,
} from "../../data-table"
import type { AdminStorageFileRow } from "./types"
import { resolveStorageAssetUrl } from "./storage-asset-url"

export type AdminStoragePickerRowActionsProps = {
  row: AdminStorageFileRow
  pickable: boolean
  selected: boolean
  multiSelect: boolean
  canDelete: boolean
  deleting?: boolean
  onPick: () => void
  onDelete?: () => void | Promise<void>
}

function deleteConfirm(row: AdminStorageFileRow) {
  return {
    title: "Xóa file khỏi kho?",
    description: (
      <>
        File <strong>{row.originalName}</strong> sẽ bị xóa vĩnh viễn khỏi kho
        lưu trữ. URL đã gán trên form sản phẩm không tự gỡ.
      </>
    ),
    confirmLabel: "Xóa khỏi kho",
    destructive: true,
  }
}

export function AdminStoragePickerRowActions({
  row,
  pickable,
  selected,
  multiSelect,
  canDelete,
  deleting,
  onPick,
  onDelete,
}: AdminStoragePickerRowActionsProps) {
  const actions: DataTableRowActionItem[] = []

  if (pickable) {
    if (multiSelect) {
      actions.push({
        key: selected ? "unpick" : "pick",
        label: selected ? "Bỏ chọn" : "Chọn",
        hint: selected
          ? "Gỡ ảnh khỏi danh sách đang chọn"
          : "Thêm ảnh vào danh sách chọn",
        onClick: onPick,
        icon: selected ? <X /> : <Check />,
        group: "primary",
        confirm: false,
      })
    } else {
      actions.push({
        key: "pick",
        label: "Chọn ảnh",
        hint: "Gán ảnh này vào sản phẩm",
        onClick: onPick,
        icon: <Check />,
        group: "primary",
        confirm: false,
      })
    }
  }

  actions.push({
    key: "open",
    label: "Mở tab mới",
    hint: "Xem file trong tab trình duyệt",
    onClick: () => {
      window.open(resolveStorageAssetUrl(row), "_blank", "noopener,noreferrer")
    },
    icon: <ExternalLink />,
    group: "primary",
    confirm: false,
  })

  if (canDelete && onDelete && !deleting) {
    actions.push({
      key: "delete",
      label: "Xóa khỏi kho",
      hint: "Xóa file vĩnh viễn trên disk",
      onClick: onDelete,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      confirm: deleteConfirm(row),
    })
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={deleting}
      autoConfirmDangerousActions
      groups={{
        primary: { label: "Thao tác", icon: Settings2 },
        danger: { label: "Xóa", sublabel: true },
      }}
    />
  )
}
