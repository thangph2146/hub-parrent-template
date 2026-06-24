"use client"

import { useMemo, type ReactNode } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { User } from "lucide-react"
import { AdminDataTable, defineDataTableActionsColumn } from "@ui/components/data-table"
import { FieldCopyButton } from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import type { HanetPersonListPage } from "@workspace/api-client"
import type { HanetFaceActionId } from "../shared/hanet-face-actions"
import type { HanetPersonActionId } from "../shared/hanet-person-api-actions"
import {
  HanetPersonRowActions,
  hanetPersonActionsColumnMeta,
} from "./hanet-person-row-actions"

/** Khớp cột preview file-storage / check-in HANET */
const HANET_PERSON_PREVIEW_COLUMN_CLASS =
  "w-[50px] min-w-[50px] max-w-[50px]"

const PERSON_PREVIEW_FRAME_CLASS =
  "flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted"

export type HanetPersonRow = HanetPersonListPage["items"][number]

export type HanetPersonsTableProps = {
  data: HanetPersonRow[]
  isLoading?: boolean
  emptyLabel?: string
  filterToolbarExtra?: ReactNode
  pageIndex: number
  pageSize: number
  total?: number
  hanetTotal?: number
  listLimited?: boolean
  onPageIndexChange: (pageIndex: number) => void
  onPageSizeChange: (pageSize: number) => void
  onFaceAction?: (actionId: HanetFaceActionId, person: HanetPersonRow) => void
  onPersonAction?: (actionId: HanetPersonActionId, person: HanetPersonRow) => void
  /** Tra cứu: ẩn phân trang và cột thao tác. */
  compact?: boolean
}

export function HanetPersonsTable({
  data,
  isLoading = false,
  emptyLabel = "Không có person cho địa điểm này.",
  filterToolbarExtra,
  pageIndex,
  pageSize,
  total = 0,
  hanetTotal,
  listLimited = false,
  onPageIndexChange,
  onPageSizeChange,
  onFaceAction,
  onPersonAction,
  compact = false,
}: HanetPersonsTableProps) {
  const resolvedTotal =
    total != null && Number.isFinite(total) && total > 0
      ? total
      : data.length < pageSize
        ? pageIndex * pageSize + data.length
        : (pageIndex + 1) * pageSize

  const columns = useMemo<ColumnDef<HanetPersonRow>[]>(
    () => [
      {
        accessorKey: "avatar",
        header: "Ảnh",
        enableColumnFilter: false,
        enableHiding: false,
        size: 50,
        minSize: 50,
        meta: {
          disableCellLineClamp: true,
          className: HANET_PERSON_PREVIEW_COLUMN_CLASS,
        },
        cell: ({ getValue }) => {
          const avatar = String(getValue() ?? "").trim()
          if (!avatar || avatar.startsWith("hanet:person:")) {
            return (
              <div
                className={cn(
                  PERSON_PREVIEW_FRAME_CLASS,
                  "text-sm text-muted-foreground",
                )}
              >
                —
              </div>
            )
          }
          return (
            <a
              href={avatar}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                PERSON_PREVIEW_FRAME_CLASS,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              title="Mở ảnh"
            >
              <img
                src={avatar}
                alt=""
                className="size-full object-cover"
                loading="lazy"
                decoding="async"
              />
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
      ...(compact
        ? []
        : [
            defineDataTableActionsColumn<HanetPersonRow>({
              columnMeta: hanetPersonActionsColumnMeta,
              cell: ({ row }) => (
                <HanetPersonRowActions
                  person={row.original}
                  onFaceAction={onFaceAction}
                  onPersonAction={onPersonAction}
                />
              ),
            }),
          ]),
    ],
    [compact, onFaceAction, onPersonAction],
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
      pagination={
        compact
          ? undefined
          : {
              page: pageIndex + 1,
              pageSize,
              total: resolvedTotal,
              currentPageRowCount: data.length,
              appliedPage: pageIndex + 1,
              appliedPageSize: pageSize,
              onPageChange: (nextPage) =>
                onPageIndexChange(Math.max(0, nextPage - 1)),
              onPageSizeChange: (nextSize) => {
                onPageSizeChange(nextSize)
                onPageIndexChange(0)
              },
              itemLabel: "người",
              isLoading,
              pageSizeOptions: [20, 50, 100],
            }
      }
      footer={
        compact ? (
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Đang tải…"
              : `Hiển thị ${data.length} kết quả tra cứu`}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Đang tải…"
              : listLimited && hanetTotal != null && hanetTotal > resolvedTotal
                ? `Hiển thị ${resolvedTotal} / ${hanetTotal} người trên HANET (Partner API chỉ trả ~50/lần) · trang ${pageIndex + 1}`
                : `Tổng ${resolvedTotal} người · trang ${pageIndex + 1}`}
          </p>
        )
      }
    />
  )
}
