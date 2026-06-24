"use client"

import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"

import type { ColumnDef } from "@tanstack/react-table"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import type { AdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import {
  type AdminTableView,
  buildAdminTableColumns,
} from "@workspace/admin-app/lib/admin-table-columns"
import type { DepartmentRow } from "../shared/types"

export function getDepartmentColumns({
  view = "list",
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  canWrite,
  canDelete,
  canRestore,
  canHardDelete,
}: {
  view?: AdminTableView
  openDetail?: (row: DepartmentRow) => void
  openEdit?: (row: DepartmentRow) => void
  rowActions: AdminCrudRowHandlers<DepartmentRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<DepartmentRow>[] {
  const dataColumns: ColumnDef<DepartmentRow>[] = [
    {
      accessorKey: "code",
      header: "Mã phòng khoa",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-medium">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "Tên phòng khoa",
      enableColumnFilter: true,
      filterFn: () => true,
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
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ getValue }) => {
        const v = getValue() as string | null
        return <span className="text-xs text-muted-foreground">{v || "—"}</span>
      },
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
    listActionsColumn: defineAdminCrudActionsColumn<DepartmentRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<DepartmentRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
