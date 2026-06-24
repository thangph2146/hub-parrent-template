"use client"

import { useMemo, type ReactNode } from "react"
import { AdminDataTable } from "@ui/components/data-table"
import type { HanetPlaceOption } from "../shared/hanet-place-parse"
import { getHanetPlaceColumns } from "./hanet-places-columns"

export type HanetPlacesTableProps = {
  data: HanetPlaceOption[]
  isLoading?: boolean
  defaultPlaceId?: string | null
  filterToolbarExtra?: ReactNode
  canWrite?: boolean
  onEdit?: (place: HanetPlaceOption) => void
  onDelete?: (place: HanetPlaceOption) => void
}

export function HanetPlacesTable({
  data,
  isLoading = false,
  defaultPlaceId,
  filterToolbarExtra,
  canWrite = false,
  onEdit,
  onDelete,
}: HanetPlacesTableProps) {
  const columns = useMemo(
    () =>
      getHanetPlaceColumns({
        defaultPlaceId: defaultPlaceId ?? "",
        canWrite,
        onEdit,
        onDelete,
      }),
    [canWrite, defaultPlaceId, onDelete, onEdit]
  )

  return (
    <AdminDataTable<HanetPlaceOption>
      tableScope="hanet-places"
      data={data}
      columns={columns}
      getRowId={(row) => row.placeId}
      isLoading={isLoading}
      emptyLabel="Không có địa điểm — bấm Thêm địa điểm hoặc kiểm tra tài khoản HANET."
      globalFilterPlaceholder="Tìm theo placeID hoặc tên địa điểm…"
      globalFilterLabel="Tìm kiếm"
      getGlobalFilterText={(row) => [row.placeId, row.name].filter(Boolean).join(" ")}
      filterToolbarExtra={filterToolbarExtra}
      footer={
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Đang tải…"
            : `Tổng ${data.length} địa điểm từ HANET`}
        </p>
      }
    />
  )
}
