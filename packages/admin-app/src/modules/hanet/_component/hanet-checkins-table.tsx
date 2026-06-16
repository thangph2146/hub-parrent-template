"use client"

import { useMemo, type ReactNode } from "react"
import { AdminDataTable } from "@ui/components/data-table"
import type { HanetCheckinRow } from "@workspace/admin-app/lib/hanet-checkin-parse"
import { getHanetCheckinColumns } from "./hanet-checkins-columns"

export type HanetCheckinsTableProps = {
  data: HanetCheckinRow[]
  isLoading?: boolean
  emptyLabel?: string
  filterToolbarExtra?: ReactNode
  summaryLine?: string | null
}

export function HanetCheckinsTable({
  data,
  isLoading = false,
  emptyLabel = "Chưa có dữ liệu check-in.",
  filterToolbarExtra,
  summaryLine,
}: HanetCheckinsTableProps) {
  const columns = useMemo(() => getHanetCheckinColumns(), [])

  return (
    <AdminDataTable<HanetCheckinRow>
      tableScope="hanet-checkins"
      data={data}
      columns={columns}
      getRowId={(row) => row.rowId}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      globalFilterPlaceholder="Tìm theo tên, aliasID, personID, deviceID…"
      globalFilterLabel="Tìm kiếm"
      getGlobalFilterText={(row) =>
        [
          row.displayName,
          row.aliasId,
          row.personId,
          row.deviceId,
          row.checkinAt,
          row.personType,
        ]
          .filter(Boolean)
          .join(" ")
      }
      filterToolbarExtra={filterToolbarExtra}
      clientPagination={{
        initialPageSize: 20,
        pageSizeOptions: [20, 50, 100],
        itemLabel: "lượt",
        isLoading,
      }}
      footer={
        summaryLine ? (
          <p className="text-sm text-muted-foreground">{summaryLine}</p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : null
      }
    />
  )
}
