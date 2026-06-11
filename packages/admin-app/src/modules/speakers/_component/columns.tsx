"use client"

import {
  defineAdminCrudActionsColumn,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"

import type { ColumnDef } from "@tanstack/react-table"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import type { AdminCrudRowHandlers } from "@workspace/admin-app/lib/admin-row-action-handlers"
import { defineRelationExportColumns } from "@ui/components/data-table"
import {
  type AdminTableView,
  buildAdminTableColumns,
  defineAdminCreatedAtColumn,
  defineAdminUpdatedAtColumn,
} from "@workspace/admin-app/lib/admin-table-columns"
import type { SpeakerRow } from "./types"

export function getSpeakerColumns({
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
  openDetail?: (row: SpeakerRow) => void
  openEdit?: (row: SpeakerRow) => void
  rowActions: AdminCrudRowHandlers<SpeakerRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<SpeakerRow>[] {
  const dataColumns: ColumnDef<SpeakerRow>[] = [
    {
      accessorKey: "name",
      header: "Tên",
      meta: { filterPlaceholder: "Lọc tên…" },
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
      header: "Chức danh",
      meta: { filterPlaceholder: "Lọc chức danh…" },
      cell: ({ getValue }) => (
        <span className="text-sm">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "organization",
      header: "Tổ chức",
      meta: { filterPlaceholder: "Lọc tổ chức…" },
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
      cell: ({ getValue }) => (
        <UsageStatusFromValue
          value={getValue() as number}
          labels={{ active: "Hoạt động", locked: "Khóa" }}
          className="text-[10px]"
        />
      ),
    },
    defineAdminCreatedAtColumn<SpeakerRow>({ defaultHidden: true }),
    defineAdminUpdatedAtColumn<SpeakerRow>({ header: "Cập nhật" }),
    ...defineRelationExportColumns<SpeakerRow>([
      { id: "email", header: "Email", getValue: (row) => row.email ?? "" },
      { id: "phone", header: "SĐT", getValue: (row) => row.phone ?? "" },
      { id: "bio", header: "Tiểu sử", getValue: (row) => row.bio ?? "" },
      {
        id: "avatar",
        header: "Avatar URL",
        getValue: (row) => row.avatar ?? "",
      },
      {
        id: "id",
        header: "ID",
        getValue: (row) => row.id,
        defaultHidden: true,
      },
    ]),
  ]

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn: defineAdminCrudActionsColumn<SpeakerRow>({
      canWrite,
      canDelete,
      canHardDelete,
      onView: openDetail,
      onEdit: openEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
    trashActionsColumn: defineAdminTrashActionsColumn<SpeakerRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  })
}
