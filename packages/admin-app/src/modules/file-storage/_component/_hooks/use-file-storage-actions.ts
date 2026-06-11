"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "@ui/components/sonner"
import {
  deleteUploadedFile,
  deleteUploadedFilesBulk,
  exportFileStorageArchive,
  fetchAllFileStorageRows,
  importFileStorageArchive,
} from "@workspace/admin-app/lib/admin-uploads"
import type { FileStorageImportConfirmState } from "../file-storage-import-confirm-dialogs"
import {
  buildAcceptAttribute,
  getRealmDefaultExtensions,
} from "../storage-upload-policy"
import type { FileStorageRow, StorageRealm } from "../types"
import { downloadStorageFile } from "../utils"

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

type UseFileStorageActionsOptions = {
  activeRealm: StorageRealm
  activeFolderPath: string
  includeDescendants: boolean
  uploadOwnerFilter?: string
  reload: () => Promise<void>
}

export function useFileStorageActions({
  activeRealm,
  activeFolderPath,
  includeDescendants,
  uploadOwnerFilter = "",
  reload,
}: UseFileStorageActionsOptions) {
  const importInputRef = useRef<HTMLInputElement>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [importConfirm, setImportConfirm] =
    useState<FileStorageImportConfirmState | null>(null)

  const handleDelete = useCallback(
    async (row: FileStorageRow) => {
      if (deletingPath) return
      setDeletingPath(row.relativePath)
      try {
        await deleteUploadedFile(row.relativePath)
        toast.success("Đã xóa file")
        await reload()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi xóa file")
        throw err
      } finally {
        setDeletingPath(null)
      }
    },
    [deletingPath, reload]
  )

  const handleDownload = useCallback(
    async (row: FileStorageRow) => {
      if (downloadingPath) return
      setDownloadingPath(row.relativePath)
      try {
        await downloadStorageFile(row)
        toast.success(`Đã tải về ${row.originalName}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi tải file")
        throw err
      } finally {
        setDownloadingPath(null)
      }
    },
    [downloadingPath]
  )

  const handleDownloadAll = useCallback(async () => {
    if (downloadingAll || downloadingPath) return
    setDownloadingAll(true)
    const listToast = toast.loading(
      "Đang xuất toàn bộ kho lưu trữ trên server…"
    )
    try {
      const { blob, meta } = await exportFileStorageArchive()
      if (!blob.size) {
        toast.error("Không có file để tải về", { id: listToast })
        return
      }
      triggerBrowserDownload(blob, "kho-luu-tru.zip")
      if (meta.skipped > 0) {
        toast.success(
          `Đã xuất ${meta.fileCount} file (${meta.skipped} file bỏ qua)`,
          { id: listToast }
        )
      } else {
        toast.success(`Đã xuất toàn bộ ${meta.fileCount} file`, {
          id: listToast,
        })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải về tất cả", {
        id: listToast,
      })
    } finally {
      setDownloadingAll(false)
    }
  }, [downloadingAll, downloadingPath])

  const handleBulkDownload = useCallback(
    async (selectedRows: FileStorageRow[]) => {
      if (!selectedRows.length) return
      let success = 0
      let fail = 0
      for (const row of selectedRows) {
        try {
          await downloadStorageFile(row)
          success++
        } catch {
          fail++
        }
      }
      if (success > 0) {
        toast.success(`Đã tải về ${success} file`)
      }
      if (fail > 0) {
        toast.error(`${fail} file tải về thất bại`)
      }
    },
    []
  )

  const runBulkDeletePaths = useCallback(
    async (paths: string[]) => {
      if (!paths.length) return
      const pending = toast.loading(`Đang xóa ${paths.length} file…`)
      try {
        const result = await deleteUploadedFilesBulk(paths)
        if (result.failed > 0) {
          const sample = result.errors
            .slice(0, 2)
            .map((entry) => entry.message)
            .join("; ")
          toast.warning(
            `Đã xóa ${result.deleted}/${paths.length} file (${result.failed} lỗi)${sample ? `: ${sample}` : ""}`,
            { id: pending }
          )
        } else {
          toast.success(`Đã xóa ${result.deleted} file`, { id: pending })
        }
        await reload()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi xóa hàng loạt", {
          id: pending,
        })
        throw err
      }
    },
    [reload]
  )

  const handleBulkDelete = useCallback(
    async (selectedRows: FileStorageRow[]) => {
      const paths = selectedRows.map((r) => r.relativePath)
      await runBulkDeletePaths(paths)
    },
    [runBulkDeletePaths]
  )

  const handleDeleteAllInTab = useCallback(async () => {
    const listToast = toast.loading("Đang lấy danh sách file trong tab…")
    try {
      const allRows = await fetchAllFileStorageRows(
        activeRealm,
        activeFolderPath || undefined,
        {
          includeDescendants,
          uploadOwnerId: uploadOwnerFilter.trim() || undefined,
        }
      )
      if (!allRows.length) {
        toast.error("Không có file để xóa", { id: listToast })
        return
      }
      toast.dismiss(listToast)
      await runBulkDeletePaths(allRows.map((r) => r.relativePath))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi xóa toàn tab", {
        id: listToast,
      })
      throw err
    }
  }, [
    activeFolderPath,
    activeRealm,
    includeDescendants,
    uploadOwnerFilter,
    runBulkDeletePaths,
  ])

  const fetchAllRowsInScope = useCallback(async () => {
    return fetchAllFileStorageRows(activeRealm, activeFolderPath || undefined, {
      includeDescendants,
      uploadOwnerId: uploadOwnerFilter.trim() || undefined,
    })
  }, [activeFolderPath, activeRealm, includeDescendants, uploadOwnerFilter])

  const clearImportConfirm = useCallback(() => {
    setImportConfirm(null)
    if (importInputRef.current) importInputRef.current.value = ""
  }, [])

  const runImportArchive = useCallback(
    async (file: File, overwrite: boolean) => {
      setImporting(true)
      const importToast = toast.loading("Đang khôi phục kho lưu trữ…")
      try {
        const result = await importFileStorageArchive(file, { overwrite })
        const total =
          result.totalEntries ??
          result.restored + result.skipped + result.failed
        const parts = [
          `Đã khôi phục ${result.restored}/${total} file trong ZIP`,
        ]
        if ((result.skippedDuplicates ?? 0) > 0) {
          parts.push(`bỏ qua ${result.skippedDuplicates} file trùng`)
        }
        if ((result.skippedUnsupportedExt ?? 0) > 0) {
          parts.push(`${result.skippedUnsupportedExt} định dạng không hỗ trợ`)
        }
        if (result.failed > 0) parts.push(`${result.failed} lỗi`)
        if ((result.listedTotal ?? 0) > 0) {
          parts.push(`${result.listedTotal} file trong kho`)
        }
        toast.success(parts.join(" · "), { id: importToast })
        if (result.failed > 0 && result.errors.length) {
          toast.error(result.errors.slice(0, 3).join("\n"))
        }
        setImportConfirm(null)
        await reload()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Lỗi khôi phục kho lưu trữ",
          { id: importToast }
        )
      } finally {
        setImporting(false)
        if (importInputRef.current) importInputRef.current.value = ""
      }
    },
    [reload]
  )

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Vui lòng chọn file ZIP backup (kho-luu-tru.zip)")
      if (importInputRef.current) importInputRef.current.value = ""
      return
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    setImportConfirm({ file, sizeMb, step: "restore" })
  }, [])

  const handleImportConfirmRestore = useCallback(() => {
    setImportConfirm((current) =>
      current ? { ...current, step: "overwrite" } : null
    )
  }, [])

  const handleImportConfirmOverwrite = useCallback(() => {
    if (!importConfirm?.file) return
    void runImportArchive(importConfirm.file, true)
  }, [importConfirm, runImportArchive])

  const handleImportSkipOverwrite = useCallback(() => {
    if (!importConfirm?.file) {
      clearImportConfirm()
      return
    }
    void runImportArchive(importConfirm.file, false)
  }, [clearImportConfirm, importConfirm, runImportArchive])

  const openUploadPicker = useCallback(() => {
    setUploadDialogOpen(true)
  }, [])

  const openImportPicker = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const uploadAccept = buildAcceptAttribute(
    getRealmDefaultExtensions(activeRealm)
  )

  return {
    uploadDialogOpen,
    setUploadDialogOpen,
    setUploading,
    importInputRef,
    uploading,
    importing,
    deletingPath,
    downloadingPath,
    downloadingAll,
    uploadAccept,
    handleImport,
    importConfirm,
    clearImportConfirm,
    handleImportConfirmRestore,
    handleImportConfirmOverwrite,
    handleImportSkipOverwrite,
    handleDownload,
    handleDownloadAll,
    handleBulkDownload,
    handleDelete,
    handleBulkDelete,
    handleDeleteAllInTab,
    fetchAllRowsInScope,
    openUploadPicker,
    openImportPicker,
  }
}
