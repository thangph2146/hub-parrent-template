"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog";
import { resolveStorageAssetUrl } from "./utils";
import type { FileStorageRow } from "./types";

type StorageVideoPreviewProps = {
  row: FileStorageRow | null;
  open: boolean;
  onClose: () => void;
};

export function StorageVideoPreview({
  row,
  open,
  onClose,
}: StorageVideoPreviewProps) {
  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-3xl gap-4 p-4">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{row.originalName}</DialogTitle>
        </DialogHeader>
        <video
          key={row.relativePath}
          src={resolveStorageAssetUrl(row)}
          controls
          playsInline
          className="max-h-[70vh] w-full rounded-md bg-black"
        />
      </DialogContent>
    </Dialog>
  );
}
