"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Film, Play } from "lucide-react"
import { FileTypeIcon, FileTypeIconSm } from "../../file-type-icon"
import { defineDataTableActionsColumn } from "../../data-table"
import { formatAdminDateTime } from "../../../lib/format-admin-datetime"
import type { AdminStorageFileRow } from "./types"

import {
  formatStorageFileSize,
  isImageStorageRow,
  resolveStorageAssetUrl,
  storageThumbnailUrl,
} from "./storage-asset-url"

import { AdminStoragePickerRowActions } from "./admin-storage-picker-row-actions"

function isVideoStorageRow(
  row: Pick<AdminStorageFileRow, "mediaKind" | "mimeType">
): boolean {
  return (
    row.mediaKind === "video" || row.mimeType?.startsWith("video/") === true
  )
}

export type AdminStoragePickerColumnsProps = {
  onPick: (row: AdminStorageFileRow) => void
  onDelete?: (row: AdminStorageFileRow) => void
  canPick?: (row: AdminStorageFileRow) => boolean
  isSelected?: (row: AdminStorageFileRow) => boolean
  multiSelect?: boolean
  canDelete?: boolean
  deletingPath?: string | null
}

export function getAdminStoragePickerColumns({
  onPick,
  onDelete,
  canPick = isImageStorageRow,
  isSelected,
  multiSelect = false,
  canDelete = false,
  deletingPath = null,
}: AdminStoragePickerColumnsProps): ColumnDef<AdminStorageFileRow, unknown>[] {
  return [
    {
      id: "preview",
      header: "Xem trước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 80,
      meta: { className: "w-[88px] min-w-[88px] max-w-[88px]" },
      cell: ({ row }) => {
        const item = row.original
        const pickable = canPick(item)
        if (isImageStorageRow(item)) {
          return (
            <button
              type="button"
              disabled={!pickable}
              onClick={() => pickable && onPick(item)}
              className={[
                "flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-muted disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              <img
                src={storageThumbnailUrl(item)}
                alt={item.originalName}
                className="size-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          )
        }

        if (isVideoStorageRow(item)) {
          return (
            <div className="relative flex size-16 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              <Film className="size-8 text-muted-foreground" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Play className="size-6 fill-white text-white" />
              </span>
            </div>
          )
        }

        return <FileTypeIcon filename={item.originalName} />
      },
    },

    {
      accessorKey: "originalName",
      header: "Tên file",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ getValue, row }) => (
        <div className="flex min-w-0 items-center gap-2">
          <FileTypeIconSm filename={row.original.originalName} />
          <a
            href={resolveStorageAssetUrl(row.original)}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium underline-offset-2 hover:underline"
            title={row.original.originalName}
            onClick={(e) => e.stopPropagation()}
          >
            {String(getValue())}
          </a>
        </div>
      ),
    },
    {
      accessorKey: "size",
      header: "Kích thước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 100,
      meta: { className: "w-[100px] min-w-[100px] max-w-[100px]" },
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatStorageFileSize(Number(getValue() ?? 0))}
        </span>
      ),
    },

    {
      accessorKey: "createdAt",
      header: "Ngày tải",
      enableSorting: false,
      enableColumnFilter: false,
      size: 140,
      meta: { className: "w-[140px] min-w-[140px] max-w-[140px]" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatAdminDateTime(getValue() as number | string)}
        </span>
      ),
    },

    defineDataTableActionsColumn<AdminStorageFileRow>({
      cell: ({ row }) => {
        const item = row.original
        const pickable = canPick(item)
        const selected = Boolean(isSelected?.(item))
        const isDeleting = deletingPath === item.relativePath

        return (
          <AdminStoragePickerRowActions
            row={item}
            pickable={pickable}
            selected={selected}
            multiSelect={multiSelect}
            canDelete={canDelete}
            deleting={isDeleting}
            onPick={() => onPick(item)}
            onDelete={onDelete ? () => onDelete(item) : undefined}
          />
        )
      },
    }),
  ]
}
