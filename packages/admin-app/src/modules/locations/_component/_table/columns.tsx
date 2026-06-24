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
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
} from "@workspace/admin-app/lib/admin-table-columns"
import type { LocationRow } from "../shared/types"

export function getLocationColumns({
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
  openDetail?: (row: LocationRow) => void
  openEdit?: (row: LocationRow) => void
  rowActions: AdminCrudRowHandlers<LocationRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<LocationRow>[] {
  const dataColumns: ColumnDef<LocationRow>[] = [
    {
      accessorKey: "name",
      header: "Tên",
      enableColumnFilter: true,
      filterFn: () => true,
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
      enableColumnFilter: true,
      filterFn: () => true,
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
    defineAdminCreatedAtColumn<LocationRow>({ defaultHidden: true }),
    defineAdminUpdatedAtColumn<LocationRow>({ header: "Cập nhật" }),
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<LocationRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<LocationRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
