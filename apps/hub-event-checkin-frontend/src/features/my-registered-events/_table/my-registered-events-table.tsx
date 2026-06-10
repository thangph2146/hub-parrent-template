"use client"

import { useCallback, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  AdminDataTable,
  adminTableRowSelectionProps,
  type AdminDataTableBulkAction,
} from "@ui/components/data-table"
import type { EventSessionUser } from "@/lib/event-auth"
import {
  ATTENDANCE_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  type MyRegisteredEventRow,
} from "../types"
import { canCancelRegistrationRow } from "../utils"

export type MyRegisteredEventsTableProps = {
  rows: MyRegisteredEventRow[]
  columns: ColumnDef<MyRegisteredEventRow, unknown>[]
  loading: boolean
  session: EventSessionUser
  exportGeneratedAt: string
  bulkActions: AdminDataTableBulkAction<MyRegisteredEventRow>[]
}

export function MyRegisteredEventsTable({
  rows,
  columns,
  loading,
  session,
  exportGeneratedAt,
  bulkActions,
}: MyRegisteredEventsTableProps) {
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const handleClearFilters = useCallback(() => {
    setGlobalFilter("")
    setColumnFilters([])
    setSelectedRowIds({})
  }, [])

  return (
    <AdminDataTable<MyRegisteredEventRow>
      tableScope="student-my-registered-events"
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      isLoading={loading}
      indexColumnExcludeFromExport
      emptyLabel="Bạn chưa đăng ký sự kiện nào."
      getGlobalFilterText={(row) =>
        [
          row.event.title,
          row.event.location,
          row.event.address,
          row.fullName,
          row.email,
          REGISTRATION_STATUS_LABELS[row.status],
          ATTENDANCE_STATUS_LABELS[row.attendanceStatus],
        ]
          .filter(Boolean)
          .join(" ")
      }
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      globalFilterPlaceholder="Tìm theo tên sự kiện, địa điểm, trạng thái..."
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      onClearFilters={handleClearFilters}
      clearFiltersVariant="destructive"
      clientPagination={{
        initialPageSize: 10,
        itemLabel: "đăng ký",
        isLoading: loading,
      }}
      xlsxExport={{
        fileName: "su-kien-cua-toi.xlsx",
        sheetName: "Su kien cua toi",
        title: "DANH SÁCH SỰ KIỆN ĐÃ ĐĂNG KÝ",
        subtitle: "Báo cáo dành cho sinh viên trên HUB Events",
        metadata: [
          { label: "Chủ đề", value: "Sự kiện sinh viên đã đăng ký" },
          { label: "Ngày xuất", value: exportGeneratedAt },
          {
            label: "Người xuất",
            value: session.name || session.email,
          },
          { label: "Email", value: session.email },
          { label: "Số bản ghi", value: rows.length },
        ],
      }}
      filterColumnVisibilityKey="checkin-my-registered-events-filters"
      canSelectRow={(row) => canCancelRegistrationRow(row.original)}
      bulkActions={bulkActions}
      footer={
        <p className="text-sm text-muted-foreground">
          {loading ? "Đang tải..." : `Tổng ${rows.length} đăng ký`}
        </p>
      }
      {...adminTableRowSelectionProps(selectedRowIds, setSelectedRowIds)}
    />
  )
}
