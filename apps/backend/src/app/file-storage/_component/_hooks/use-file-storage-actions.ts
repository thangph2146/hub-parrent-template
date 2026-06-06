"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "@ui/components/sonner";
import { uploadAdminImage } from "@/lib/admin-upload";
import { deleteUploadedFile } from "@/lib/admin-uploads";
import type { FileStorageRow, FileStorageTab } from "../types";

type UseFileStorageActionsOptions = {
  activeTab: FileStorageTab;
  reload: () => Promise<void>;
};

export function useFileStorageActions({
  activeTab,
  reload,
}: UseFileStorageActionsOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      setUploading(true);
      let success = 0;
      let fail = 0;
      for (const file of files) {
        try {
          await uploadAdminImage(file, { folderPath: "" });
          success++;
        } catch {
          fail++;
        }
      }
      if (success > 0) toast.success(`Đã tải lên ${success} file`);
      if (fail > 0) toast.error(`${fail} file tải lên thất bại`);
      await reload();
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [reload],
  );

  const handleDelete = useCallback(
    async (row: FileStorageRow) => {
      if (deletingPath) return;
      setDeletingPath(row.relativePath);
      try {
        await deleteUploadedFile(row.relativePath);
        toast.success("Đã xóa file");
        await reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi xóa file");
        throw err;
      } finally {
        setDeletingPath(null);
      }
    },
    [deletingPath, reload],
  );

  const handleBulkDelete = useCallback(
    async (selectedRows: FileStorageRow[]) => {
      const paths = selectedRows.map((r) => r.relativePath);
      if (!paths.length) return;
      try {
        await Promise.all(paths.map((p) => deleteUploadedFile(p)));
        toast.success(`Đã xóa ${paths.length} file`);
        await reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi xóa hàng loạt");
        throw err;
      }
    },
    [reload],
  );

  const openUploadPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const uploadAccept =
    activeTab === "images"
      ? "image/*"
      : "application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.mp4,.webm,image/*";

  return {
    fileInputRef,
    uploading,
    deletingPath,
    uploadAccept,
    handleUpload,
    handleDelete,
    handleBulkDelete,
    openUploadPicker,
  };
}
