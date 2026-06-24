"use client"

import { Trash2 } from "lucide-react"
import type { AdminDataTableBulkAction } from "@ui/components/data-table"
import type { PromoRow } from "../shared/types"

export function buildPromoBulkActiveActionMap({
  onBulkSetActive,
}: {
  onBulkSetActive: (rows: PromoRow[], active: boolean) => Promise<void>
}): {
  activate: AdminDataTableBulkAction<PromoRow>
  deactivate: AdminDataTableBulkAction<PromoRow>
} {
  return {
    activate: {
      id: "bulk-promo-activate",
      label: "Bật mã",
      variant: "success",
      onAction: (rows) => onBulkSetActive(rows, true),
      confirm: {
        title: "Bật các mã đã chọn?",
        description: (rows) => (
          <span>
            Áp dụng cho <strong>{rows.length}</strong> mã KM.
          </span>
        ),
        confirmLabel: "Bật",
      },
    },
    deactivate: {
      id: "bulk-promo-deactivate",
      label: "Tắt mã",
      variant: "warning",
      onAction: (rows) => onBulkSetActive(rows, false),
      confirm: {
        title: "Tắt các mã đã chọn?",
        description: (rows) => (
          <span>
            Áp dụng cho <strong>{rows.length}</strong> mã KM.
          </span>
        ),
        confirmLabel: "Tắt",
      },
    },
  }
}

export function buildPromoBulkDeleteAction({
  onBulkDelete,
}: {
  onBulkDelete: (rows: PromoRow[]) => Promise<void>
}): AdminDataTableBulkAction<PromoRow> {
  return {
    id: "bulk-promo-delete",
    label: "Xóa đã chọn",
    variant: "destructive",
    icon: <Trash2 className="size-3.5" aria-hidden />,
    confirm: {
      title: "Xóa các mã đã chọn?",
      description: (rows) => (
        <span>
          Bạn đã chọn <strong>{rows.length}</strong> mã KM.
        </span>
      ),
      confirmLabel: "Xóa",
      destructive: true,
    },
    onAction: onBulkDelete,
  }
}

export function buildPromoBulkActions({
  canDelete,
  onBulkDelete,
}: {
  canDelete: boolean
  onBulkDelete: (rows: PromoRow[]) => Promise<void>
}): AdminDataTableBulkAction<PromoRow>[] {
  if (!canDelete) return []
  return [buildPromoBulkDeleteAction({ onBulkDelete })]
}
