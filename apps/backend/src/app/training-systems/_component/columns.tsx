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
import { formatAdminDateTime } from "@/lib/format-admin-datetime"
import type { TrainingSystemRow } from "./types"

export function getTrainingSystemColumns({
  view = "list",
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  canWrite,
}: {
  view?: AdminTableView
  openDetail?: (row: TrainingSystemRow) => void
  openEdit?: (row: TrainingSystemRow) => void
  rowActions: AdminCrudRowHandlers<TrainingSystemRow>
  canWrite: boolean
}): ColumnDef<TrainingSystemRow>[] {
  const dataColumns: ColumnDef<TrainingSystemRow>[] = [
    {
      accessorKey: "name",
      header: "Tên",
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
      accessorKey: "code",
      header: "Mã",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{String(getValue() ?? "—")}</span>
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
    {
      accessorKey: "updatedAt",
      header: "Cập nhật",
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
          {formatAdminDateTime(getValue() as string)}
        </span>
      ),
    },
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<TrainingSystemRow>({
      canWrite,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<TrainingSystemRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
