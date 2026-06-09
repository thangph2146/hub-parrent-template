"use client"

import { Trash2 } from "lucide-react"
import { AdminConfirmActionDialog } from "@ui/components/admin"
import type { GuideConfirmAction } from "../types"

export interface GuidesConfirmDialogProps {
  confirmAction: GuideConfirmAction | null
  deleteMutation: {
    isPending: boolean
  }
  purgeMutation: {
    isPending: boolean
  }
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onPurgeConfirm: () => void
  contentClassName?: string
}

export function GuidesConfirmDialog({
  confirmAction,
  deleteMutation,
  purgeMutation,
  onOpenChange,
  onConfirm,
  onPurgeConfirm,
  contentClassName,
}: GuidesConfirmDialogProps) {
  if (!confirmAction) return null

  const { kind, row } = confirmAction

  if (kind === "delete" && row) {
    return (
      <AdminConfirmActionDialog
        open={true}
        onOpenChange={onOpenChange}
        contentClassName={contentClassName}
        footerClassName="gap-2"
        icon={<Trash2 className="size-5 shrink-0 text-destructive" />}
        title="Xóa nhóm hướng dẫn?"
        description={`Xóa nhóm hướng dẫn <strong>${row.sectionKey}</strong>? Thao tác không thể hoàn tác.`}
        confirmLabel="Xóa"
        confirmDestructive
        confirmDisabled={deleteMutation.isPending}
        confirmLoading={deleteMutation.isPending}
        onConfirm={() => {
          void onConfirm()
        }}
      />
    )
  }

  if (kind === "purge" && row) {
    return (
      <AdminConfirmActionDialog
        open={true}
        onOpenChange={onOpenChange}
        contentClassName={contentClassName}
        footerClassName="gap-2"
        icon={<Trash2 className="size-5 shrink-0 text-destructive" />}
        title="Xóa vĩnh viễn nhóm hướng dẫn?"
        description={`Xóa vĩnh viễn nhóm hướng dẫn <strong>${row.sectionKey}</strong>? Thao tác <strong>không thể</strong> hoàn tác.`}
        confirmLabel="Xóa vĩnh viễn"
        confirmDestructive
        confirmDisabled={purgeMutation.isPending}
        confirmLoading={purgeMutation.isPending}
        onConfirm={() => {
          void onPurgeConfirm()
        }}
      />
    )
  }

  return null
}
