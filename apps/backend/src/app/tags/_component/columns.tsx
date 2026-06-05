"use client"

import type { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import {
  AdminTableCrudRowActions,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  type AdminTableView,
  buildAdminTableColumns,
} from "@/lib/admin-table-columns"
import type { TagRow, TagTreeRow } from "./types"
import { formatDateTime } from "./utils"
import { resolveIcon } from "@ui/lib/icons"
import { createElement } from "react"

function TagIcon({ name }: { name: string | null | undefined }) {
  if (!name) return <div className="size-5 shrink-0" />
  const Icon = resolveIcon(name)
  if (!Icon) return <div className="size-5 shrink-0" />
  return createElement(Icon, {
    className: "size-5 shrink-0 text-muted-foreground",
  })
}

export function getTagColumns({
  view = "list",
  openDetail = () => {},
  openEdit = () => {},
  rowActions,
  canWrite,
}: {
  view?: AdminTableView
  openDetail?: (row: TagRow) => void
  openEdit?: (row: TagRow) => void
  rowActions: AdminCrudRowHandlers<TagRow>
  canWrite: boolean
}): ColumnDef<TagTreeRow>[] {
  const dataColumns: ColumnDef<TagTreeRow>[] = [
    {
      accessorKey: "name",
      header: "Tên / nhóm",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: {
        exportValue: (row) =>
          row.isGroup ? `${row.name} (${row.itemCount ?? 0} thẻ)` : row.name,
      },
      cell: ({ row, getValue }) =>
        row.original.isGroup ? (
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{String(getValue())}</span>
            <Badge variant="outline" className="text-[10px]">
              {row.original.itemCount} thẻ
            </Badge>
          </div>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2 text-left font-medium text-foreground transition-colors hover:text-primary"
            onClick={() => openDetail(row.original)}
          >
            <TagIcon name={row.original.icon} />
            {String(getValue())}
          </button>
        ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: {
        exportValue: (row) => (row.isGroup ? `nhom:${row.slug}` : row.slug),
      },
      cell: ({ row, getValue }) => (
        <span className="font-mono text-xs">
          {row.original.isGroup
            ? `nhom:${String(getValue())}`
            : String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Cập nhật / quy mô",
      enableColumnFilter: true,
      meta: {
        filterVariant: "date-range",
        filterPlaceholder: "Chọn khoảng ngày",
        exportValue: (row) =>
          row.isGroup ? "Nhóm theo tiền tố slug" : (row.updatedAt ?? ""),
      },
      filterFn: (
        row: Row<TagTreeRow>,
        columnId: string,
        filterValue: unknown
      ) => {
        if (filterValue == null || filterValue === "") return true
        if (row.original.isGroup) return true
        const dates = String(filterValue).split(",").filter(Boolean)
        if (!dates.length) return true
        const rowDate = new Date(row.getValue<string>(columnId))
        if (Number.isNaN(rowDate.getTime())) return true
        if (dates.length === 1) return rowDate >= new Date(dates[0])
        return rowDate >= new Date(dates[0]) && rowDate <= new Date(dates[1])
      },
      cell: ({ row, getValue }) =>
        row.original.isGroup ? (
          <span className="text-xs text-muted-foreground">
            Nhóm theo tiền tố slug
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(getValue() as string)}
          </span>
        ),
    },
  ]

  const listActionsColumn: ColumnDef<TagTreeRow> = {
    id: "actions",
    header: "Thao tác",
    enableSorting: false,
    enableColumnFilter: true,
      filterFn: () => true,
    cell: ({ row }) =>
      row.original.isGroup ? null : (
        <AdminTableCrudRowActions
          canWrite={canWrite}
          recordLabel={rowActions.getRecordLabel(row.original)}
          onView={() => openDetail(row.original)}
          onEdit={() => openEdit(row.original)}
          onSoftDelete={
            rowActions.onSoftDelete
              ? () => rowActions.onSoftDelete?.(row.original)
              : undefined
          }
          onPurge={
            rowActions.onPurge
              ? () => rowActions.onPurge?.(row.original)
              : undefined
          }
        />
      ),
  }

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn,
    trashActionsColumn: defineAdminTrashActionsColumn<TagRow>({
      canWrite,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }) as ColumnDef<TagTreeRow>,
  })
}
