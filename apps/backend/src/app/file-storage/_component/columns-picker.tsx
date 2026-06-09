"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { FileTypeIcon, FileTypeIconSm } from "@ui/components/file-type-icon"
import { defineDataTableActionsColumn } from "@ui/components/data-table"
import { Film, Play } from "lucide-react"
import { formatAdminDateTime } from "@/lib/format-admin-datetime"
import type { FileStorageRow } from "./types"
import {
  formatFileSize,
  formatUploadOwnerCell,
  isImageStorageRow,
  isVideoStorageRow,
  resolveStorageAssetUrl,
  storageThumbnailUrl,
} from "./utils"

export type FileStoragePickerColumnsProps = {
  onPick: (row: FileStorageRow) => void
  canPick?: (row: FileStorageRow) => boolean
  isSelected?: (row: FileStorageRow) => boolean
  multiSelect?: boolean
}

export function getFileStoragePickerColumns({
  onPick,
  canPick = isImageStorageRow,
  isSelected,
  multiSelect = false,
}: FileStoragePickerColumnsProps): ColumnDef<FileStorageRow>[] {
  return [
    {
      id: "preview",
      header: "Xem trước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 80,
      meta: { className: "w-[180px] min-w-[180px] max-w-[180px]" },
      cell: ({ row }) => {
        const item = row.original
        const pickable = canPick(item)
        const selected = Boolean(isSelected?.(item))

        if (isImageStorageRow(item)) {
          return (
            <button
              type="button"
              disabled={!pickable}
              onClick={() => pickable && onPick(item)}
              className={[
                "flex size-full cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-muted disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "ring-2 ring-primary ring-offset-1"
                  : "border-border",
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
            <div className="relative flex size-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
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
      accessorKey: "mediaKind",
      header: "Loại media",
      enableSorting: false,
      enableColumnFilter: false,
      size: 110,
      meta: { className: "w-[110px] min-w-[110px] max-w-[110px]" },
      cell: ({ row }) => {
        const kind = row.original.mediaKind
        const label =
          kind === "image"
            ? "Ảnh"
            : kind === "video"
              ? "Video"
              : kind === "audio"
                ? "Âm thanh"
                : kind === "document"
                  ? "Tài liệu"
                  : kind === "archive"
                    ? "Nén"
                    : "Khác"

        return (
          <Badge variant="secondary" className="text-[10px]">
            {label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "size",
      header: "Kích thước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 120,
      meta: { className: "w-[120px] min-w-[120px] max-w-[120px]" },
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatFileSize(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tải lên",
      enableSorting: false,
      enableColumnFilter: false,
      size: 180,
      meta: { className: "w-[180px] min-w-[180px] max-w-[180px]" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatAdminDateTime(getValue() as number | string)}
        </span>
      ),
    },
    defineDataTableActionsColumn<FileStorageRow>({
      cell: ({ row }) => {
        const item = row.original
        const pickable = canPick(item)
        const selected = Boolean(isSelected?.(item))
        return (
          <Button
            type="button"
            size="sm"
            variant={!pickable ? "outline" : selected ? "secondary" : "default"}
            disabled={!pickable}
            className="h-8 shrink-0 px-3 text-xs"
            onClick={() => onPick(item)}
          >
            {multiSelect ? (selected ? "Bỏ chọn" : "Chọn") : "Chọn"}
          </Button>
        )
      },
    }),
  ]
}
