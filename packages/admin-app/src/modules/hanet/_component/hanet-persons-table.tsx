"use client"

import { useMemo, type ReactNode } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar"
import { AdminDataTable } from "@ui/components/data-table"
import { FieldCopyButton } from "@ui/components/field"
import type { HanetPersonListPage } from "@workspace/api-client"

export type HanetPersonRow = HanetPersonListPage["items"][number]

export type HanetPersonsTableProps = {
  data: HanetPersonRow[]
  isLoading?: boolean
  emptyLabel?: string
  filterToolbarExtra?: ReactNode
  pageIndex: number
  pageSize: number
  total?: number
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
}

function resolvePersonListTotal(
  pageIndex: number,
  pageSize: number,
  rowCount: number,
  total?: number,
): number {
  if (total != null && Number.isFinite(total)) return total
  if (rowCount < pageSize) return pageIndex * pageSize + rowCount
  return (pageIndex + 2) * pageSize
}

export function HanetPersonsTable({
  data,
  isLoading = false,
  emptyLabel = "Không có person cho địa điểm này.",
  filterToolbarExtra,
  pageIndex,
  pageSize,
  total,
  onPageIndexChange,
  onPageSizeChange,
}: HanetPersonsTableProps) {
  const resolvedTotal = resolvePersonListTotal(
    pageIndex,
    pageSize,
    data.length,
    total,
  )

  const columns = useMemo<ColumnDef<HanetPersonRow>[]>(
    () => [
      {
        accessorKey: "avatar",
        header: "Avatar",
        enableColumnFilter: false,
        enableHiding: false,
        size: 56,
        meta: {
          disableCellLineClamp: true,
          className: "w-22 min-w-22 max-w-22",
        },
        cell: ({ getValue }) => {
          const avatar = String(getValue() ?? "").trim()
          if (!avatar || avatar.startsWith("hanet:person:")) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          return (
            <a
              href={avatar}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar size="xl" className="size-22">
                <AvatarImage src={avatar} alt="" />
                <AvatarFallback className="text-xs">?</AvatarFallback>
              </Avatar>
            </a>
          )
        },
      },
      {
        accessorKey: "displayName",
        header: "Tên",
        enableColumnFilter: false,
        size: 220,
        cell: ({ getValue }) => {
          const name = String(getValue() ?? "").trim() || "—"
          return (
            <div className="flex min-w-0 items-start gap-2 py-0.5">
              <User
                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 whitespace-normal break-words font-medium leading-snug">
                {name}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "personId",
        header: "personID",
        enableColumnFilter: false,
        size: 160,
        cell: ({ getValue }) => {
          const personId = String(getValue() ?? "").trim()
          if (!personId) return "—"
          return (
            <div className="flex items-start gap-2 py-0.5">
              <code className="text-xs font-medium break-all leading-snug">
                {personId}
              </code>
              <FieldCopyButton text={personId} />
            </div>
          )
        },
      },
      {
        accessorKey: "aliasId",
        header: "aliasID",
        enableColumnFilter: false,
        size: 120,
        cell: ({ getValue }) => {
          const aliasId = String(getValue() ?? "").trim()
          if (!aliasId) return "—"
          return (
            <div className="flex items-start gap-2 py-0.5">
              <span className="text-sm whitespace-normal break-all leading-snug">
                {aliasId}
              </span>
              <FieldCopyButton text={aliasId} />
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <AdminDataTable<HanetPersonRow>
      tableScope="hanet-persons"
      data={data}
      columns={columns}
      getRowId={(row) => row.personId}
      isLoading={isLoading}
      emptyLabel={emptyLabel}
      globalFilterPlaceholder="Tìm theo tên, personID hoặc aliasID…"
      globalFilterLabel="Tìm kiếm"
      getGlobalFilterText={(row) =>
        [row.displayName, row.personId, row.aliasId].filter(Boolean).join(" ")
      }
      filterToolbarExtra={filterToolbarExtra}
      pagination={{
        page: pageIndex + 1,
        pageSize,
        total: resolvedTotal,
        currentPageRowCount: data.length,
        appliedPage: pageIndex + 1,
        appliedPageSize: pageSize,
        onPageChange: (nextPage) => onPageIndexChange(Math.max(0, nextPage - 1)),
        onPageSizeChange: (nextSize) => {
          onPageSizeChange(nextSize)
          onPageIndexChange(0)
        },
        itemLabel: "người",
        isLoading,
        pageSizeOptions: [20, 50, 100],
      }}
      footer={
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Đang tải…"
            : total != null
              ? `Tổng ${total} người · trang ${pageIndex + 1}`
              : `Trang ${pageIndex + 1} · ${data.length} người trên trang này`}
        </p>
      }
    />
  )
}
