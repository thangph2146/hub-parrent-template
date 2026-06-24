"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import { cn } from "@ui/lib/utils"
import { ArrowRight, GitBranch } from "lucide-react"
import type { EntityRelationRow, EntitySchemaRow } from "../shared/types"
import { DOMAIN_BADGE_CLASS, formatEntityRowCount } from "../shared/utils"

function RefBadges({ tables }: { tables: string[] }) {
  if (!tables.length) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return (
    <div className="flex flex-wrap gap-1">
      {tables.map((table) => (
        <Badge key={table} variant="outline" className="font-mono text-[10px]">
          {table}
        </Badge>
      ))}
    </div>
  )
}

const CARDINALITY_LABEL: Record<EntityRelationRow["cardinality"], string> = {
  "many-to-one": "N:1",
  "one-to-one": "1:1",
  self: "self",
}

export function getEntitySchemaColumns(): ColumnDef<EntitySchemaRow>[] {
  return [
    {
      accessorKey: "tableName",
      header: "Bảng DB",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm font-medium">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "entityName",
      header: "Entity",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "exportModelName",
      header: "Model export",
      enableColumnFilter: false,
      meta: { defaultHidden: true },
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "activeRowCount",
      header: "Bản ghi",
      enableColumnFilter: false,
      size: 100,
      meta: { className: "w-[100px] min-w-[100px] max-w-[120px]" },
      cell: ({ row }) => {
        const {
          activeRowCount,
          rowCount,
          trashedRowCount,
          auxiliaryRowCount,
          expectedRowCount,
          verificationStatus,
        } = row.original
        if (activeRowCount < 0) {
          return <span className="text-xs text-muted-foreground">—</span>
        }
        return (
          <div className="tabular-nums">
            <span className="text-sm font-medium">
              {formatEntityRowCount(activeRowCount)}
            </span>
            {expectedRowCount != null ? (
              <p
                className={cn(
                  "text-[10px]",
                  verificationStatus === "ok"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : verificationStatus === "under"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400"
                )}
              >
                kỳ vọng {formatEntityRowCount(expectedRowCount)}
              </p>
            ) : null}
            {auxiliaryRowCount && auxiliaryRowCount > 0 ? (
              <p className="text-[10px] text-muted-foreground">
                +{formatEntityRowCount(auxiliaryRowCount)} import_id_map
              </p>
            ) : null}
            {trashedRowCount > 0 ? (
              <p className="text-[10px] text-muted-foreground">
                +{formatEntityRowCount(trashedRowCount)} thùng rác
              </p>
            ) : rowCount !== activeRowCount ? (
              <p className="text-[10px] text-muted-foreground">
                tổng {formatEntityRowCount(rowCount)}
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      accessorKey: "domain",
      header: "Nhóm",
      enableColumnFilter: false,
      cell: ({ getValue }) => {
        const domain = String(getValue())
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-normal",
              DOMAIN_BADGE_CLASS[domain]
            )}
          >
            {domain}
          </Badge>
        )
      },
    },
    {
      accessorKey: "columnCount",
      header: "Cột",
      enableColumnFilter: false,
      size: 72,
      meta: { className: "w-[72px] min-w-[72px] max-w-[72px]" },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {row.original.columnCount}
          {row.original.fkCount > 0 ? (
            <span className="text-[10px]"> ({row.original.fkCount} FK)</span>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: "referencesOut",
      header: "Tham chiếu tới",
      enableColumnFilter: false,
      cell: ({ row }) => <RefBadges tables={row.original.referencesOut} />,
    },
    {
      accessorKey: "referencedBy",
      header: "Được tham chiếu bởi",
      enableColumnFilter: false,
      cell: ({ row }) => <RefBadges tables={row.original.referencedBy} />,
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      enableColumnFilter: false,
      meta: { defaultHidden: true },
      cell: ({ getValue }) => (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {String(getValue() || "—")}
        </span>
      ),
    },
  ]
}

export function getEntityRelationColumns(): ColumnDef<EntityRelationRow>[] {
  return [
    {
      accessorKey: "fromTable",
      header: "Từ bảng",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "fromColumn",
      header: "Cột",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(getValue())}
        </span>
      ),
    },
    {
      id: "arrow",
      header: "",
      enableSorting: false,
      enableColumnFilter: false,
      size: 40,
      meta: { className: "w-10 min-w-10 max-w-10 px-0 text-center" },
      cell: () => (
        <ArrowRight className="mx-auto size-4 text-muted-foreground" />
      ),
    },
    {
      accessorKey: "toTable",
      header: "Đến bảng",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "toColumn",
      header: "Cột đích",
      enableColumnFilter: false,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "cardinality",
      header: "Quan hệ",
      enableColumnFilter: false,
      size: 88,
      cell: ({ getValue }) => {
        const value = getValue() as EntityRelationRow["cardinality"]
        return (
          <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
            <GitBranch className="size-3" />
            {CARDINALITY_LABEL[value]}
          </Badge>
        )
      },
    },
    {
      accessorKey: "deleteRule",
      header: "On delete",
      enableColumnFilter: false,
      meta: { defaultHidden: true },
      cell: ({ getValue }) => {
        const rule = getValue() as string | undefined
        return rule ? (
          <Badge variant="outline" className="font-mono text-[10px]">
            {rule}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
      },
    },
  ]
}
