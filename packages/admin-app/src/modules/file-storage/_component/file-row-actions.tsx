"use client"

import {
  Download,
  ExternalLink,
  Eye,
  Film,
  Settings2,
  Trash2,
} from "lucide-react"

import {
  DataTableRowActionsMenu,
  type DataTableRowActionItem,
} from "@ui/components/data-table"

import type { FileStorageRow } from "./types"

import { resolveStorageAssetUrl } from "./utils"

export type FileStorageRowActionsProps = {
  row: FileStorageRow

  canDelete: boolean

  deleting?: boolean

  downloading?: boolean

  onPreviewImage?: () => void

  onPreviewVideo?: () => void

  onDownload: () => void | Promise<void>

  onDelete: () => void | Promise<void>
}

function deleteConfirm(row: FileStorageRow) {
  return {
    title: "Xóa file?",

    description: (
      <>
        File <strong>{row.originalName}</strong> sẽ bị xóa vĩnh viễn khỏi kho
        lưu trữ. Hành động này không thể hoàn tác.
      </>
    ),

    confirmLabel: "Xóa",

    destructive: true,
  }
}

export function FileStorageRowActions({
  row,

  canDelete,

  deleting,

  downloading,

  onPreviewImage,

  onPreviewVideo,

  onDownload,

  onDelete,
}: FileStorageRowActionsProps) {
  const actions: DataTableRowActionItem[] = [
    {
      key: "download",

      label: "Tải về",

      hint: "Lưu file xuống máy",

      onClick: onDownload,

      icon: <Download />,

      group: "primary",

      confirm: false,
    },

    {
      key: "open",

      label: "Mở tab mới",

      hint: "Xem file trong tab trình duyệt",

      onClick: () => {
        window.open(
          resolveStorageAssetUrl(row),
          "_blank",
          "noopener,noreferrer"
        )
      },

      icon: <ExternalLink />,

      group: "primary",

      confirm: false,
    },
  ]

  if (onPreviewImage) {
    actions.unshift({
      key: "preview-image",

      label: "Xem ảnh",

      hint: "Mở lightbox xem ảnh",

      onClick: onPreviewImage,

      icon: <Eye />,

      group: "primary",

      confirm: false,
    })
  }

  if (onPreviewVideo) {
    actions.unshift({
      key: "preview-video",

      label: "Phát video",

      hint: "Xem trước video trong hộp thoại",

      onClick: onPreviewVideo,

      icon: <Film />,

      group: "primary",

      confirm: false,
    })
  }

  if (canDelete && !deleting) {
    actions.push({
      key: "delete",

      label: "Xóa",

      hint: "Xóa vĩnh viễn khỏi kho lưu trữ",

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
      busy={deleting || downloading}
      autoConfirmDangerousActions
      groups={{
        primary: { label: "Thao tác", icon: Settings2 },

        danger: { label: "Xóa", sublabel: true },
      }}
    />
  )
}
