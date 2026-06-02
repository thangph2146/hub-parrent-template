"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import { Eye, EyeOff } from "lucide-react"
import {
  ADMIN_TABLE_ACTIONS_COLUMN_META,
  AdminTableCrudRowActions,
} from "@/components/admin-table-row-actions"
import type { GuideGroup } from "./types"
import { parseContent } from "./utils"

export interface GuideColumnsProps {
  onView: (row: GuideGroup) => void
  onEdit: (row: GuideGroup) => void
  onDelete: (row: GuideGroup) => void
  onPurge: (row: GuideGroup) => void
  canWrite: boolean
}

export function getGuidesColumns({
  onView,
  onEdit,
  onDelete,
  onPurge,
  canWrite,
}: GuideColumnsProps): ColumnDef<GuideGroup>[] {
  return [
    {
      accessorKey: "sectionKey",
      header: "Section Key",
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
      enableColumnFilter: false,
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
      enableColumnFilter: false,
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
      enableColumnFilter: false,
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
    {
      id: "actions",
      header: "Thao tác",
      enableColumnFilter: false,
      enableSorting: false,
      meta: ADMIN_TABLE_ACTIONS_COLUMN_META,
      cell: ({ row }) => {
        const data = row.original
        if (!data) return null
        return (
          <AdminTableCrudRowActions
            canWrite={canWrite}
            onView={() => onView(data)}
            onEdit={() => onEdit(data)}
            onSoftDelete={() => onDelete(data)}
            onPurge={() => onPurge(data)}
          />
        )
      },
    },
  ]
}
