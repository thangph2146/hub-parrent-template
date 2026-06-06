"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@ui/components/badge";
import { FileTypeIcon, FileTypeIconSm } from "@ui/components/file-type-icon";
import { defineDataTableActionsColumn } from "@ui/components/data-table";
import { FileImage } from "lucide-react";
import { formatAdminDateTime } from "@/lib/format-admin-datetime";
import { FileStorageRowActions } from "./file-row-actions";
import type { FileStorageRow } from "./types";
import { formatFileSize, getShortMimeType, isImageMime } from "./utils";

export type FileStorageColumnsProps = {
  isImagesTab: boolean;
  canDelete: boolean;
  deletingPath: string | null;
  onPreview: (row: FileStorageRow) => void;
  onDelete: (row: FileStorageRow) => void | Promise<void>;
};

export function getFileStorageColumns({
  isImagesTab,
  canDelete,
  deletingPath,
  onPreview,
  onDelete,
}: FileStorageColumnsProps): ColumnDef<FileStorageRow>[] {
  return [
    {
      id: "preview",
      header: "Xem trước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 80,
      meta: { className: "w-[180px] min-w-[180px] max-w-[180px]" },
      cell: ({ row }) =>
        isImagesTab && isImageMime(row.original.mimeType) ? (
          <button
            type="button"
            onClick={() => onPreview(row.original)}
            className="flex size-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-muted"
          >
            <img
              src={row.original.url}
              alt={row.original.originalName}
              className="size-full object-cover"
              loading="lazy"
            />
          </button>
        ) : (
          <FileTypeIcon filename={row.original.originalName} />
        ),
    },
    {
      accessorKey: "originalName",
      header: "Tên file",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ getValue, row }) => (
        <div className="flex min-w-0 items-center gap-2">
          {isImagesTab ? (
            <FileImage className="size-4 shrink-0 text-muted-foreground/60" />
          ) : (
            <FileTypeIconSm filename={row.original.originalName} />
          )}
          <a
            href={row.original.url}
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
      accessorKey: "size",
      header: "Kích thước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 120,
      meta: { className: "w-[120px] min-w-[120px] max-w-[120px]" },
      cell: ({ getValue }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatFileSize(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "mimeType",
      header: "Loại",
      enableSorting: false,
      enableColumnFilter: false,
      size: 100,
      meta: { className: "w-[100px] min-w-[100px] max-w-[100px]" },
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {getShortMimeType(String(getValue()))}
        </Badge>
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
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatAdminDateTime(getValue() as number | string)}
        </span>
      ),
    },
    defineDataTableActionsColumn<FileStorageRow>({
      cell: ({ row }) => (
        <FileStorageRowActions
          row={row.original}
          isImagesTab={isImagesTab}
          canDelete={canDelete}
          deleting={deletingPath === row.original.relativePath}
          onPreview={
            isImagesTab && isImageMime(row.original.mimeType)
              ? () => onPreview(row.original)
              : undefined
          }
          onDelete={() => onDelete(row.original)}
        />
      ),
    }),
  ];
}
