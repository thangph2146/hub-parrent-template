"use client"

import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"

import type { ColumnDef } from "@tanstack/react-table"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  type AdminTableView,
  buildAdminTableColumns,
} from "@/lib/admin-table-columns"
import type { AcademicYearRow } from "./types"

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN")
}

export function getAcademicYearColumns({
  view = "list",
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  canWrite,
}: {
  view?: AdminTableView
  openDetail?: (row: AcademicYearRow) => void
  openEdit?: (row: AcademicYearRow) => void
  rowActions: AdminCrudRowHandlers<AcademicYearRow>
  canWrite: boolean
}): ColumnDef<AcademicYearRow>[] {
  const dataColumns: ColumnDef<AcademicYearRow>[] = [
    {
      accessorKey: "name",
      header: "Tên niên khóa",
      enableColumnFilter: false,
      cell: ({ row, getValue }) => (
        <button
          type="button"
          className="text-left font-medium text-foreground transition-colors hover:text-primary"
          onClick={() => openDetail(row.original)}
        >
          {String(getValue())}
        </button>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Ngày bắt đầu",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        const rowVal = row.getValue(columnId) as string
        if (!rowVal) return false
        const [fromStr, toStr] = String(filterValue).split(",")
        const rowDate = rowVal.split("T")[0]
        if (fromStr && rowDate < fromStr) return false
        if (toStr && rowDate > toStr) return false
        return true
      },
      meta: { filterVariant: "date-range" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "endDate",
      header: "Ngày kết thúc",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        const rowVal = row.getValue(columnId) as string
        if (!rowVal) return false
        const [fromStr, toStr] = String(filterValue).split(",")
        const rowDate = rowVal.split("T")[0]
        if (fromStr && rowDate < fromStr) return false
        if (toStr && rowDate > toStr) return false
        return true
      },
      meta: { filterVariant: "date-range" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == null || filterValue === "") return true
        return String(row.getValue(columnId)) === String(filterValue)
      },
      meta: {
        filterVariant: "select",
        selectOptions: [
          { value: "1", label: "Hoạt động" },
          { value: "0", label: "Tắt" },
        ],
      },
      cell: ({ getValue }) => (
        <UsageStatusFromValue
          value={getValue() as number}
          labels={{ active: "Hoạt động", locked: "Tắt" }}
          className="text-[10px]"
        />
      ),
    },
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<AcademicYearRow>({
      canWrite,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<AcademicYearRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
