"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"
import { defineRelationExportColumns } from "@ui/components/data-table"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  type AdminTableView,
  buildAdminTableColumns,
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
} from "@/lib/admin-table-columns"
import type { CameraRow } from "./types"

export function getCameraColumns({
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
  openDetail?: (row: CameraRow) => void
  openEdit?: (row: CameraRow) => void
  rowActions: AdminCrudRowHandlers<CameraRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<CameraRow>[] {
  const dataColumns: ColumnDef<CameraRow>[] = [
    {
      accessorKey: "name",
      header: "Tên camera",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: { filterVariant: "text", filterPlaceholder: "Lọc tên…" },
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
      header: "Mã HANET",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: { filterVariant: "text", filterPlaceholder: "Lọc mã…" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      id: "linkedEventTitle",
      header: "Sự kiện",
      accessorFn: (row) => row.linkedEventTitle ?? row.linkedEventId ?? "",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: {
        filterVariant: "text",
        filterPlaceholder: "Lọc sự kiện…",
        defaultHidden: false,
      },
      cell: ({ row }) => (
        <span className="block max-w-[180px] truncate text-sm">
          {row.original.linkedEventTitle?.trim() ||
            row.original.linkedEventId ||
            "—"}
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: { filterVariant: "text", filterPlaceholder: "Lọc IP…" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "port",
      header: "Cổng",
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
        exportValue: (row) => (Number(row.status) === 1 ? "Hoạt động" : "Khóa"),
      },
      cell: ({ getValue }) => (
        <UsageStatusFromValue
          value={getValue() as number}
          labels={{ active: "Hoạt động", locked: "Khóa" }}
          className="text-[10px]"
        />
      ),
    },
    ...defineRelationExportColumns<CameraRow>([
      {
        id: "linkedEventId",
        header: "ID sự kiện",
        getValue: (row) => row.linkedEventId ?? "",
        defaultHidden: true,
      },
      {
        id: "linkedEventSlug",
        header: "Slug sự kiện",
        getValue: (row) => row.linkedEventSlug ?? "",
        defaultHidden: true,
      },
      {
        id: "username",
        header: "Username",
        getValue: (row) => row.username ?? "",
      },
      {
        id: "id",
        header: "ID",
        getValue: (row) => row.id,
        defaultHidden: true,
      },
    ]),
    defineAdminCreatedAtColumn<CameraRow>({ defaultHidden: true }),
    defineAdminUpdatedAtColumn<CameraRow>({ defaultHidden: true }),
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<CameraRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<CameraRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
