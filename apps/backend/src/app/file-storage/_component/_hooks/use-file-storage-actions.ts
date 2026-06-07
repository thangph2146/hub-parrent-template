"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "@ui/components/sonner";
import { uploadAdminImage } from "@/lib/admin-upload";
import {
  deleteUploadedFile,
  fetchAllStoredFileStorageRows,
  importFileStorageArchive,
} from "@/lib/admin-uploads";
import type { FileStorageRow, FileStorageTab } from "../types";
import { downloadStorageFile, downloadStorageFilesAsZip } from "../utils";

type UseFileStorageActionsOptions = {
  activeTab: FileStorageTab;
  reload: () => Promise<void>;
};

export function useFileStorageActions({
  activeTab,
  reload,
}: UseFileStorageActionsOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

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

  const handleDownload = useCallback(
    async (row: FileStorageRow) => {
      if (downloadingPath) return;
      setDownloadingPath(row.relativePath);
      try {
        await downloadStorageFile(row);
        toast.success(`Đã tải về ${row.originalName}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi tải file");
        throw err;
      } finally {
        setDownloadingPath(null);
      }
    },
    [downloadingPath],
  );

  const handleDownloadAll = useCallback(async () => {
    if (downloadingAll || downloadingPath) return;
    setDownloadingAll(true);
    const listToast = toast.loading("Đang lấy danh sách kho lưu trữ…");
    try {
      const allRows = await fetchAllStoredFileStorageRows();
      if (!allRows.length) {
        toast.error("Không có file để tải về", { id: listToast });
        return;
      }
      toast.loading(`Đang tải và nén ${allRows.length} file…`, {
        id: listToast,
      });
      const { success, fail } = await downloadStorageFilesAsZip(
        allRows,
        "kho-luu-tru.zip",
        (done, total) => {
          toast.loading(`Đang tải file ${done}/${total}…`, { id: listToast });
        },
      );
      if (fail > 0) {
        toast.success(`Đã tải về ${success} file (${fail} lỗi)`, {
          id: listToast,
        });
      } else {
        toast.success(`Đã tải về tất cả ${success} file`, { id: listToast });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải về tất cả", {
        id: listToast,
      });
    } finally {
      setDownloadingAll(false);
    }
  }, [downloadingAll, downloadingPath]);

  const handleBulkDownload = useCallback(async (selectedRows: FileStorageRow[]) => {
    if (!selectedRows.length) return;
    let success = 0;
    let fail = 0;
    for (const row of selectedRows) {
      try {
        await downloadStorageFile(row);
        success++;
      } catch {
        fail++;
      }
    }
    if (success > 0) {
      toast.success(`Đã tải về ${success} file`);
    }
    if (fail > 0) {
      toast.error(`${fail} file tải về thất bại`);
    }
  }, []);

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

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".zip")) {
        toast.error("Vui lòng chọn file ZIP backup (kho-luu-tru.zip)");
        if (importInputRef.current) importInputRef.current.value = "";
        return;
      }

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const confirmed = window.confirm(
        `Khôi phục kho lưu trữ từ "${file.name}" (${sizeMb} MB)?\n\n` +
          "• File trùng đường dẫn sẽ được bỏ qua\n" +
          "• Chỉ chấp nhận file ZIP xuất từ trang này",
      );
      if (!confirmed) {
        if (importInputRef.current) importInputRef.current.value = "";
        return;
      }

      const overwrite = window.confirm(
        "Ghi đè file trùng đường dẫn?\n\nOK = Ghi đè\nCancel = Bỏ qua file trùng",
      );

      setImporting(true);
      const importToast = toast.loading("Đang khôi phục kho lưu trữ…");
      try {
        const result = await importFileStorageArchive(file, { overwrite });
        const parts = [`Đã khôi phục ${result.restored} file`];
        if (result.skipped > 0) parts.push(`bỏ qua ${result.skipped}`);
        if (result.failed > 0) parts.push(`${result.failed} lỗi`);
        toast.success(parts.join(", "), { id: importToast });
        if (result.failed > 0 && result.errors.length) {
          toast.error(result.errors.slice(0, 3).join("\n"));
        }
        await reload();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Lỗi khôi phục kho lưu trữ",
          { id: importToast },
        );
      } finally {
        setImporting(false);
        if (importInputRef.current) importInputRef.current.value = "";
      }
    },
    [reload],
  );

  const openUploadPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openImportPicker = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const uploadAccept =
    activeTab === "images"
      ? "image/*"
      : "application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.mp4,.webm,image/*";

  return {
    fileInputRef,
    importInputRef,
    uploading,
    importing,
    deletingPath,
    downloadingPath,
    downloadingAll,
    uploadAccept,
    handleUpload,
    handleImport,
    handleDownload,
    handleDownloadAll,
    handleBulkDownload,
    handleDelete,
    handleBulkDelete,
    openUploadPicker,
    openImportPicker,
  };
}
