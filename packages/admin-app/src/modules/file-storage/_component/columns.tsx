"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@ui/components/badge"

import { FileTypeIcon, FileTypeIconSm } from "@ui/components/file-type-icon"

import {
  defineDataTableActionsColumn,
  type DataTableUserSearchHandlers,
} from "@ui/components/data-table"

import { Film, Play } from "lucide-react"

import { formatAdminDateTime } from "@workspace/admin-app/lib/format-admin-datetime"

import { FileStorageRowActions } from "./file-row-actions"

import type { FileStorageRow } from "./types"

import {
  formatFileSize,
  formatUploadOwnerCell,
  FILE_STORAGE_PREVIEW_COL_CLASS,
  FILE_STORAGE_PREVIEW_THUMB_CLASS,
  FILE_STORAGE_PREVIEW_THUMB_PX,
  isImageStorageRow,
  isVideoStorageRow,
  resolveStorageAssetUrl,
  storageThumbnailUrl,
} from "./utils"

export type FileStorageColumnsProps = {
  canDelete: boolean

  deletingPath: string | null

  downloadingPath: string | null

  onPreviewImage: (row: FileStorageRow) => void

  onPreviewVideo: (row: FileStorageRow) => void

  onDownload: (row: FileStorageRow) => void | Promise<void>

  onDelete: (row: FileStorageRow) => void | Promise<void>

  uploadOwnerSearchHandlers: DataTableUserSearchHandlers
}

export function getFileStorageColumns({
  canDelete,

  deletingPath,

  downloadingPath,

  onPreviewImage,

  onPreviewVideo,

  onDownload,

  onDelete,

  uploadOwnerSearchHandlers,
}: FileStorageColumnsProps): ColumnDef<FileStorageRow>[] {
  return [
    {
      id: "preview",

      header: "Xem trước",

      enableSorting: false,

      enableColumnFilter: false,

      size: 76,

      meta: { className: FILE_STORAGE_PREVIEW_COL_CLASS },

      cell: ({ row }) => {
        const item = row.original

        if (isImageStorageRow(item)) {
          return (
            <button
              type="button"
              onClick={() => onPreviewImage(item)}
              className={`flex ${FILE_STORAGE_PREVIEW_THUMB_CLASS} cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-muted`}
            >
              <img
                src={storageThumbnailUrl(item, FILE_STORAGE_PREVIEW_THUMB_PX)}
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
            <button
              type="button"
              onClick={() => onPreviewVideo(item)}
              className={`relative flex ${FILE_STORAGE_PREVIEW_THUMB_CLASS} cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-muted`}
            >
              <Film className="size-5 text-muted-foreground" />

              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Play className="size-4 fill-white text-white" />
              </span>
            </button>
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
      id: "uploadOwnerId",

      accessorFn: (row) => row.uploadOwnerId ?? "",

      header: "Người upload",

      enableSorting: false,

      enableColumnFilter: true,

      filterFn: () => true,

      size: 160,

      meta: {
        className: "w-[160px] min-w-[160px] max-w-[200px]",
        filterVariant: "user-search",
        filterLabel: "Người upload",
        filterPlaceholder: "Tên, email hoặc ID tài khoản…",
        userSearchHandlers: uploadOwnerSearchHandlers,
      },

      cell: ({ row }) => {
        const { primary, title } = formatUploadOwnerCell(row.original)
        if (primary === "—") {
          return (
            <span className="text-xs text-muted-foreground" title={title}>
              —
            </span>
          )
        }
        return (
          <span
            className="block truncate text-xs font-medium text-foreground"
            title={title}
          >
            {primary}
          </span>
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
      cell: ({ row }) => (
        <FileStorageRowActions
          row={row.original}
          canDelete={canDelete}
          deleting={deletingPath === row.original.relativePath}
          downloading={downloadingPath === row.original.relativePath}
          onPreviewImage={
            isImageStorageRow(row.original)
              ? () => onPreviewImage(row.original)
              : undefined
          }
          onPreviewVideo={
            isVideoStorageRow(row.original)
              ? () => onPreviewVideo(row.original)
              : undefined
          }
          onDownload={() => onDownload(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    }),
  ]
}
