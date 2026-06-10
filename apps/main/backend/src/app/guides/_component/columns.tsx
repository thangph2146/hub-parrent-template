"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import { Eye, EyeOff } from "lucide-react"
import { defineAdminCrudActionsColumn } from "@ui/components/admin"
import type { AdminCrudRowHandlers } from "@/lib/admin-row-action-handlers"
import type { GuideGroup } from "./types"
import { parseContent } from "./utils"

export interface GuideColumnsProps {
  onView: (row: GuideGroup) => void
  onEdit: (row: GuideGroup) => void
  rowActions: AdminCrudRowHandlers<GuideGroup>
  canWrite: boolean
}

export function getGuidesColumns({
  onView,
  onEdit,
  rowActions,
  canWrite,
}: GuideColumnsProps): ColumnDef<GuideGroup>[] {
  return [
    {
      accessorKey: "sectionKey",
      header: "Section Key",
      enableColumnFilter: true,
      filterFn: () => true,
      meta: { filterVariant: "text", filterPlaceholder: "Lọc section key…" },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{String(getValue())}</span>
      ),
    },
    {
      id: "title",
      accessorFn: (row) => parseContent(row.content).title ?? "",
      header: "Tiêu đề",
      enableColumnFilter: true,
      cell: ({ getValue }) => (
        <span className="font-medium">{String(getValue())}</span>
      ),
      meta: { filterPlaceholder: "Lọc tiêu đề" },
    },
    {
      id: "order",
      accessorFn: (row) => parseContent(row.content).order ?? 0,
      header: "Thứ tự",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono tabular-nums">
          {String(getValue())}
        </Badge>
      ),
    },
    {
      id: "stepsCount",
      accessorFn: (row) => parseContent(row.content).steps?.length ?? 0,
      header: "Số bước",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => (
        <Badge variant="secondary" className="font-mono tabular-nums">
          {String(getValue())}
        </Badge>
      ),
    },
    {
      id: "isVisible",
      accessorFn: (row) => row.isVisible,
      header: "Hiển thị",
      enableColumnFilter: true,
      filterFn: () => true,
      cell: ({ getValue }) => {
        const visible = getValue()
        return (
          <Badge variant={visible ? "default" : "secondary"} className="gap-1">
            {visible ? (
              <>
                <Eye className="size-3" aria-hidden />
                Có
              </>
            ) : (
              <>
                <EyeOff className="size-3" aria-hidden />
                Không
              </>
            )}
          </Badge>
        )
      },
    },
    defineAdminCrudActionsColumn<GuideGroup>({
      canWrite,
      onView,
      onEdit,
      onSoftDelete: rowActions.onSoftDelete,
      onPurge: rowActions.onPurge,
      getRecordLabel: rowActions.getRecordLabel,
    }),
  ]
}
