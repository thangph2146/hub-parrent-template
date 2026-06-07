"use client";

import {
  Download,
  ExternalLink,
  Eye,
  Settings2,
  Trash2,
} from "lucide-react";
import {
  DataTableRowActionsMenu,
  type DataTableRowActionItem,
} from "@ui/components/data-table";
import type { FileStorageRow } from "./types";
import { isImageMime } from "./utils";

export type FileStorageRowActionsProps = {
  row: FileStorageRow;
  isImagesTab: boolean;
  canDelete: boolean;
  deleting?: boolean;
  downloading?: boolean;
  onPreview?: () => void;
  onDownload: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
};

function deleteConfirm(row: FileStorageRow) {
  return {
    title: "Xóa file?",
    description: (
      <>
        File <strong>{row.originalName}</strong> sẽ bị xóa vĩnh viễn khỏi kho
        lưu trữ. Hành động này không thể hoàn tác.
      </>
    ),
    confirmLabel: "Xóa",
    destructive: true,
  };
}

export function FileStorageRowActions({
  row,
  isImagesTab,
  canDelete,
  deleting,
  downloading,
  onPreview,
  onDownload,
  onDelete,
}: FileStorageRowActionsProps) {
  const actions: DataTableRowActionItem[] = [
    {
      key: "download",
      label: "Tải về",
      hint: "Lưu file xuống máy",
      onClick: onDownload,
      icon: <Download />,
      group: "primary",
      confirm: false,
    },
    {
      key: "open",
      label: "Mở tab mới",
      hint: "Xem file trong tab trình duyệt",
      onClick: () => {
        window.open(row.url, "_blank", "noopener,noreferrer");
      },
      icon: <ExternalLink />,
      group: "primary",
      confirm: false,
    },
  ];

  if (isImagesTab && isImageMime(row.mimeType) && onPreview) {
    actions.unshift({
      key: "preview",
      label: "Xem trước",
      hint: "Mở lightbox xem ảnh",
      onClick: onPreview,
      icon: <Eye />,
      group: "primary",
      confirm: false,
    });
  }

  if (canDelete && !deleting) {
    actions.push({
      key: "delete",
      label: "Xóa",
      hint: "Xóa vĩnh viễn khỏi kho lưu trữ",
      onClick: onDelete,
      icon: <Trash2 />,
      group: "danger",
      menuVariant: "destructive",
      confirm: deleteConfirm(row),
    });
  }

  return (
    <DataTableRowActionsMenu
      actions={actions}
      busy={deleting || downloading}
      autoConfirmDangerousActions
      groups={{
        primary: { label: "Thao tác", icon: Settings2 },
        danger: { label: "Xóa", sublabel: true },
      }}
    />
  );
}
