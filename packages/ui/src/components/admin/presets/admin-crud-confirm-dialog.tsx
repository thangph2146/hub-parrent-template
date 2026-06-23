"use client"

import { Archive, ArchiveRestore, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { AdminConfirmActionDialog } from "./confirm-dialog"

export type CrudConfirmKind = "delete" | "restore" | "purge"

export type CrudConfirmAction<T> = {
  kind: CrudConfirmKind
  row: T
} | null

export type AdminCrudConfirmDialogProps<T> = {
  confirmAction: CrudConfirmAction<T>
  deleteMutation?: { isPending: boolean }
  restoreMutation?: { isPending: boolean }
  purgeMutation?: { isPending: boolean }
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onPurgeConfirm?: () => void
  onRestoreConfirm?: () => void
  contentClassName?: string
  entityLabel: string
  getName: (row: T) => string
  getSubInfo?: (row: T) => string | null
}

export function AdminCrudConfirmDialog<T>({
  confirmAction,
  deleteMutation,
  restoreMutation,
  purgeMutation,
  onOpenChange,
  onConfirm,
  onPurgeConfirm,
  onRestoreConfirm,
  contentClassName,
  entityLabel,
  getName,
  getSubInfo,
}: AdminCrudConfirmDialogProps<T>) {
  if (!confirmAction) return null

  const { kind, row } = confirmAction
  const name = getName(row)
  const subInfo = getSubInfo?.(row)

  const icon: Record<CrudConfirmKind, ReactNode> = {
    delete: <Archive className="size-5 shrink-0 text-destructive" />,
    restore: <ArchiveRestore className="size-5 shrink-0 text-primary" />,
    purge: <Trash2 className="size-5 shrink-0 text-destructive" />,
  }

  const title: Record<CrudConfirmKind, string> = {
    delete: `Đưa ${entityLabel} vào thùng rác?`,
    restore: `Khôi phục ${entityLabel}?`,
    purge: `Xóa vĩnh viễn ${entityLabel}?`,
  }

  const description: Record<CrudConfirmKind, string> = {
    delete: subInfo
      ? `«${name}» (mã ${subInfo}) sẽ ẩn khỏi hệ thống cho đến khi khôi phục.`
      : `«${name}» sẽ ẩn khỏi hệ thống cho đến khi khôi phục.`,
    restore: `Đưa «${name}» trở lại danh sách đang hoạt động.`,
    purge: `«${name}» sẽ bị xoá khỏi cơ sở dữ liệu. Không thể hoàn tác.`,
  }

  const confirmLabel: Record<CrudConfirmKind, string> = {
    delete: "Xóa tạm",
    restore: "Khôi phục",
    purge: "Xóa vĩnh viễn",
  }

  const handleConfirm = () => {
    if (kind === "purge" && onPurgeConfirm) {
      onPurgeConfirm()
    } else if (kind === "restore" && onRestoreConfirm) {
      onRestoreConfirm()
    } else {
      onConfirm()
    }
  }

  const isPending =
    (kind === "delete" && deleteMutation?.isPending) ||
    (kind === "restore" && restoreMutation?.isPending) ||
    (kind === "purge" && purgeMutation?.isPending) ||
    false

  return (
    <AdminConfirmActionDialog
      open
      onOpenChange={onOpenChange}
      contentClassName={contentClassName}
      footerClassName="gap-2"
      icon={icon[kind]}
      title={title[kind]}
      description={description[kind]}
      confirmLabel={confirmLabel[kind]}
      confirmDestructive={kind !== "restore"}
      confirmDisabled={isPending}
      onConfirm={() => {
        void handleConfirm()
      }}
    />
  )
}
