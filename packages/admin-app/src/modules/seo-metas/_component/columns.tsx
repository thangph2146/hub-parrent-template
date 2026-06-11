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
import type { SeoMetaRow } from "./types"

export function getSeoMetaColumns({
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
  openDetail?: (row: SeoMetaRow) => void
  openEdit?: (row: SeoMetaRow) => void
  rowActions: AdminCrudRowHandlers<SeoMetaRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<SeoMetaRow>[] {
  const dataColumns: ColumnDef<SeoMetaRow>[] = [
    {
      accessorKey: "page",
      header: "Đường dẫn",
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
      accessorKey: "title",
      header: "Title SEO",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => {
        const val = getValue() as string | null
        return (
          <span className="block max-w-[200px] truncate text-sm text-muted-foreground">
            {val ?? "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "keywords",
      header: "Từ khóa",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => {
        const val = getValue() as string | null
        return (
          <span className="block max-w-[150px] truncate text-xs text-muted-foreground">
            {val ?? "—"}
          </span>
        )
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
    listActionsColumn: defineAdminCrudActionsColumn<SeoMetaRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<SeoMetaRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
