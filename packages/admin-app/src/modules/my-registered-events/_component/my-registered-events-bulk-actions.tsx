"use client"

import type { Dispatch, SetStateAction } from "react"
import { XCircle } from "lucide-react"
import { toast } from "@ui/components/sonner"
import type { AdminDataTableBulkAction } from "@ui/components/data-table"
import type { createStoreSyncSdk } from "@workspace/api-client"
import {
  cancelMyEventRegistration,
  type MyRegisteredEvent,
} from "../_lib/my-registered-events"
import type { MyRegisteredEventRow } from "./types"
import { canCancelRegistrationRow } from "./utils"

export function buildMyRegisteredEventsBulkActions({
  api,
  setRows,
  reload,
}: {
  api: ReturnType<typeof createStoreSyncSdk>
  setRows: Dispatch<SetStateAction<MyRegisteredEvent[]>>
  reload: (options?: { silent?: boolean }) => Promise<void>
}): AdminDataTableBulkAction<MyRegisteredEventRow>[] {
  return [
    {
      id: "cancel",
      label: "Hủy đăng ký",
      variant: "destructive",
      icon: <XCircle className="size-4" />,
      disabled: (selectedRows) =>
        selectedRows.length === 0 ||
        selectedRows.some((row) => !canCancelRegistrationRow(row)),
      confirm: {
        title: "Hủy các đăng ký đã chọn?",
        description:
          "Chỉ hủy được khi còn trong thời gian đăng ký, chưa check-in và sự kiện chưa bắt đầu.",
        confirmLabel: "Hủy đăng ký",
        destructive: true,
      },
      onAction: async (selectedRows) => {
        if (selectedRows.some((row) => !canCancelRegistrationRow(row))) {
          toast.error(
            "Có đăng ký đã chọn không thể hủy (ngoài thời gian đăng ký, đã check-in hoặc sự kiện đã bắt đầu).",
          )
          return
        }
        if (selectedRows.length === 0) {
          toast.error("Vui lòng chọn ít nhất một đăng ký có thể hủy.")
          return
        }

        try {
          const updatedRows = await Promise.all(
            selectedRows.map((row) => cancelMyEventRegistration(api, row.id)),
          )
          const updatedById = new Map(
            updatedRows.map((row) => [row.id, row] as const),
          )
          setRows((current) =>
            current.map((item) => updatedById.get(item.id) ?? item),
          )
          toast.success(
            selectedRows.length === 1
              ? "Đã hủy đăng ký sự kiện."
              : `Đã hủy ${selectedRows.length} đăng ký sự kiện.`,
          )
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Không thể hủy đăng ký.",
          )
          await reload({ silent: true })
          throw err
        }
      },
    },
  ]
}
