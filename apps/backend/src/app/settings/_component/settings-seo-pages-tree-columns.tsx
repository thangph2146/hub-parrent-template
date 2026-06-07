"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import { FolderTree, Globe } from "lucide-react"
import {
  AdminTableCrudRowActions,
  defineAdminTrashActionsColumn,
} from "@ui/components/admin"
import {
  DataTableRowActionsClearRegistrar,
  defineDataTableActionsColumn,
} from "@ui/components/data-table"
import { UsageStatusFromValue } from "@ui/components/usage-status-badge"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import {
  type AdminTableView,
  buildAdminTableColumns,
} from "@/lib/admin-table-columns"
import type { SeoMetaTreeRow } from "./settings-seo-pages-tree"

export function getSettingsSeoPagesTreeColumns({
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
  openDetail?: (row: SeoMetaTreeRow) => void
  openEdit?: (row: SeoMetaTreeRow) => void
  rowActions: AdminCrudRowHandlers<SeoMetaTreeRow>
  canWrite: boolean
  canDelete?: boolean
  canRestore?: boolean
  canHardDelete?: boolean
}): ColumnDef<SeoMetaTreeRow>[] {
  const dataColumns: ColumnDef<SeoMetaTreeRow>[] = [
    {
      accessorKey: "page",
      header: "Nhóm / đường dẫn",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: {
        exportValue: (row) =>
          row.isGroup
            ? `${row.groupLabel ?? row.page} (${row.childCount ?? 0} trang)`
            : row.page,
      },
      cell: ({ row, getValue }) => {
        if (row.original.isGroup) {
          return (
            <div className="flex items-center gap-2">
              <FolderTree
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="font-medium">{String(getValue())}</span>
              <Badge variant="outline" className="text-[10px] tabular-nums">
                {row.original.childCount ?? 0} trang
              </Badge>
            </div>
          )
        }

        if (row.original.isPlaceholder) {
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Globe
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <code className="text-sm text-muted-foreground">
                {String(getValue())}
              </code>
              <Badge variant="secondary" className="text-[10px]">
                Chưa cấu hình
              </Badge>
            </div>
          )
        }

        return (
          <button
            type="button"
            className="text-left font-medium text-foreground transition-colors hover:text-primary"
            onClick={() => openDetail(row.original)}
          >
            {String(getValue())}
          </button>
        )
      },
    },
    {
      accessorKey: "title",
      header: "Title SEO",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ row, getValue }) => {
        if (row.original.isGroup) return null
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
      cell: ({ row, getValue }) => {
        if (row.original.isGroup) return null
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
        if (row.original.isGroup || row.original.isPlaceholder) return true
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
      cell: ({ row, getValue }) => {
        if (row.original.isGroup || row.original.isPlaceholder) return null
        return (
          <UsageStatusFromValue
            value={getValue() as number}
            labels={{ active: "Hoạt động", locked: "Tắt" }}
            className="text-[10px]"
          />
        )
      },
    },
  ]

  const listActionsColumn = defineDataTableActionsColumn<SeoMetaTreeRow>({
    enableColumnFilter: true,
    filterFn: () => true,
    cell: ({ row }) =>
      row.original.isGroup || row.original.isPlaceholder ? (
        <DataTableRowActionsClearRegistrar />
      ) : (
        <AdminTableCrudRowActions
          canWrite={canWrite}
          canDelete={canDelete}
          canHardDelete={canHardDelete}
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
  })

  return buildAdminTableColumns({
    view,
    dataColumns,
    listActionsColumn,
    trashActionsColumn: defineAdminTrashActionsColumn<SeoMetaTreeRow>({
      canWrite,
      canRestore,
      canHardDelete,
      onRestore: rowActions.onRestore,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
      resolveRowProps: (row) =>
        row.isGroup || row.isPlaceholder
          ? { canRestore: false, canHardDelete: false }
          : {},
    }),
  })
}
