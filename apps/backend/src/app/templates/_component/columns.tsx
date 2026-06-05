"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  type AdminTableView,
  buildAdminTableColumns,
} from "@/lib/admin-table-columns"
import type { TemplateRow } from "./types"

export function getTemplateColumns({
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
  openDetail?: (row: TemplateRow) => void
  openEdit?: (row: TemplateRow) => void
  rowActions: AdminCrudRowHandlers<TemplateRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<TemplateRow>[] {
  const dataColumns: ColumnDef<TemplateRow>[] = [
    {
      accessorKey: "name",
      header: "Tên mẫu",
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
      accessorKey: "code",
      header: "Mã",
      enableColumnFilter: true,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{String(getValue() ?? "—")}</span>
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
      cell: ({ getValue }) => (
        <UsageStatusFromValue
          value={getValue() as number}
          labels={{ active: "Hoạt động", locked: "Khóa" }}
          className="text-[10px]"
        />
      ),
    },
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<TemplateRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<TemplateRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
