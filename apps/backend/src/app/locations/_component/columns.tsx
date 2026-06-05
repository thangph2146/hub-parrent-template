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
import type { LocationRow } from "./types"

export function getLocationColumns({
  view = "list",
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  canWrite,
}: {
  view?: AdminTableView
  openDetail?: (row: LocationRow) => void
  openEdit?: (row: LocationRow) => void
  rowActions: AdminCrudRowHandlers<LocationRow>
  canWrite: boolean
}): ColumnDef<LocationRow>[] {
  const dataColumns: ColumnDef<LocationRow>[] = [
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
          {String(getValue() ?? "—")}
        </button>
      ),
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="text-sm">{String(getValue() ?? "—")}</span>
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
          { value: "0", label: "Khóa" },
        ],
      },
      cell: ({ getValue }) => {
        const status = getValue() as number | null
        return (
          <UsageStatusFromValue
            value={status === 0 ? 0 : 1}
            labels={{ active: "Hoạt động", locked: "Khóa" }}
            className="text-[10px]"
          />
        )
      },
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
    listActionsColumn: defineAdminCrudActionsColumn<LocationRow>({
      canWrite,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<LocationRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
