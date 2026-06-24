"use client"

import { useCallback, useRef, useState } from "react"
import { toast, type ToastOptions } from "@ui/components/sonner"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { storageOperationToastOptions } from "@workspace/admin-app/lib/storage-operation-toast"
import {
  deleteUploadedFilesBulk,
  exportFileStorageArchive,
  fetchAllFileStorageRows,
  importFileStorageArchive,
} from "@workspace/admin-app/lib/admin-uploads"
import type { FileStorageImportConfirmState } from "../dialogs/file-storage-import-confirm-dialogs"
import {
  buildAcceptAttribute,
  getRealmDefaultExtensions,
} from "../shared/storage-upload-policy"
import type { FileStorageRow, StorageRealm } from "../shared/types"
import { downloadStorageFile } from "../shared/utils"

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

function buildFileStorageToastOptions(input: {
  startedAt: number
  operationLabel: string
  variables: unknown
  data?: unknown
  error?: unknown
  adminApi?: { method: string; path: string }
  extra?: Pick<ToastOptions, "id" | "duration">
}): ToastOptions {
  return storageOperationToastOptions(input)
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
  const api = useAdminApi()
  const importInputRef = useRef<HTMLInputElement>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [importConfirm, setImportConfirm] =
    useState<FileStorageImportConfirmState | null>(null)

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
    const startedAt = Date.now()
    const listToast = toast.loading(
      "Đang xuất toàn bộ kho lưu trữ trên server…",
      buildFileStorageToastOptions({
        startedAt,
        operationLabel: "File storage — xuất toàn bộ kho",
        variables: {},
        adminApi: { method: "GET", path: "/admin/uploads/export" },
      }),
    )
    try {
      const { blob, meta } = await exportFileStorageArchive(api)
      if (!blob.size) {
        toast.error("Không có file để tải về", {
          id: listToast,
          copyContext: {
            storageOperation: true,
            operationLabel: "File storage — xuất toàn bộ kho",
            data: meta,
          },
        })
        return
      }
      triggerBrowserDownload(blob, "kho-luu-tru.zip")
      const toastOpts = buildFileStorageToastOptions({
        startedAt,
        operationLabel: "File storage — xuất toàn bộ kho",
        variables: {},
        data: meta,
        adminApi: { method: "GET", path: "/admin/uploads/export" },
        extra: { id: listToast },
      })
      if (meta.skipped > 0) {
        toast.success(
          `Đã xuất ${meta.fileCount} file (${meta.skipped} file bỏ qua)`,
          toastOpts,
        )
      } else {
        toast.success(`Đã xuất toàn bộ ${meta.fileCount} file`, toastOpts)
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Lỗi tải về tất cả",
        buildFileStorageToastOptions({
          startedAt,
          operationLabel: "File storage — xuất toàn bộ kho",
          variables: {},
          error: err,
          adminApi: { method: "GET", path: "/admin/uploads/export" },
          extra: { id: listToast },
        }),
      )
    } finally {
      setDownloadingAll(false)
    }
  }, [api, downloadingAll, downloadingPath])

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
      const startedAt = Date.now()
      const operationLabel = `File storage — xóa ${paths.length} file`
      const pending = toast.loading(
        `Đang xóa ${paths.length} file…`,
        buildFileStorageToastOptions({
          startedAt,
          operationLabel,
          variables: { paths },
          adminApi: { method: "POST", path: "/admin/uploads/bulk-delete" },
        })
      )
      try {
        const result = await deleteUploadedFilesBulk(api, paths)
        const toastOpts = buildFileStorageToastOptions({
          startedAt,
          operationLabel,
          variables: { paths },
          data: result,
          adminApi: { method: "POST", path: "/admin/uploads/bulk-delete" },
          extra: { id: pending },
        })
        if (result.failed > 0) {
          const sample = result.errors
            .slice(0, 2)
            .map((entry) => entry.message)
            .join("; ")
          const message =
            result.deleted > 0
              ? `Đã xóa ${result.deleted}/${paths.length} file (${result.failed} lỗi)${sample ? `: ${sample}` : ""}`
              : `Không xóa được file${sample ? `: ${sample}` : ""}`
          const notify = result.deleted > 0 ? toast.warning : toast.error
          notify(message, toastOpts)
        } else {
          toast.success(`Đã xóa ${result.deleted} file`, toastOpts)
        }
        await reload()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Lỗi xóa hàng loạt",
          buildFileStorageToastOptions({
            startedAt,
            operationLabel,
            variables: { paths },
            error: err,
            adminApi: { method: "POST", path: "/admin/uploads/bulk-delete" },
            extra: { id: pending },
          })
        )
        throw err
      }
    },
    [api, reload]
  )

  const handleBulkDelete = useCallback(
    async (selectedRows: FileStorageRow[]) => {
      const paths = selectedRows.map((r) => r.relativePath)
      await runBulkDeletePaths(paths)
    },
    [runBulkDeletePaths]
  )

  const handleDelete = useCallback(
    async (row: FileStorageRow) => {
      if (deletingPath) return
      setDeletingPath(row.relativePath)
      try {
        await runBulkDeletePaths([row.relativePath])
      } finally {
        setDeletingPath(null)
      }
    },
    [deletingPath, runBulkDeletePaths]
  )

  const handleDeleteAllInTab = useCallback(async () => {
    const startedAt = Date.now()
    const operationLabel = "File storage — liệt kê file trong tab để xóa"
    const listToast = toast.loading(
      "Đang lấy danh sách file trong tab…",
      storageOperationToastOptions({
        startedAt,
        operationLabel,
        variables: {
          realm: activeRealm,
          folderPath: activeFolderPath || undefined,
          includeDescendants,
        },
        adminApi: { method: "GET", path: "/admin/uploads" },
      }),
    )
    try {
      const allRows = await fetchAllFileStorageRows(api, 
        activeRealm,
        activeFolderPath || undefined,
        {
          includeDescendants,
          uploadOwnerId: uploadOwnerFilter.trim() || undefined,
        }
      )
      if (!allRows.length) {
        toast.error(
          "Không có file để xóa",
          storageOperationToastOptions({
            startedAt,
            operationLabel,
            variables: { count: 0 },
            adminApi: { method: "GET", path: "/admin/uploads" },
            extra: { id: listToast },
          }),
        )
        return
      }
      toast.dismiss(listToast)
      await runBulkDeletePaths(allRows.map((r) => r.relativePath))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Lỗi xóa toàn tab",
        storageOperationToastOptions({
          startedAt,
          operationLabel,
          error: err,
          adminApi: { method: "GET", path: "/admin/uploads" },
          extra: { id: listToast },
        }),
      )
      throw err
    }
  }, [
    api,
    activeFolderPath,
    activeRealm,
    includeDescendants,
    uploadOwnerFilter,
    runBulkDeletePaths,
  ])

  const fetchAllRowsInScope = useCallback(async () => {
    return fetchAllFileStorageRows(api, activeRealm, activeFolderPath || undefined, {
      includeDescendants,
      uploadOwnerId: uploadOwnerFilter.trim() || undefined,
    })
  }, [api, activeFolderPath, activeRealm, includeDescendants, uploadOwnerFilter])

  const clearImportConfirm = useCallback(() => {
    setImportConfirm(null)
    if (importInputRef.current) importInputRef.current.value = ""
  }, [])

  const runImportArchive = useCallback(
    async (file: File, overwrite: boolean) => {
      setImporting(true)
      const startedAt = Date.now()
      const operationLabel = "File storage — khôi phục kho từ ZIP"
      const importToast = toast.loading(
        "Đang khôi phục kho lưu trữ…",
        buildFileStorageToastOptions({
          startedAt,
          operationLabel,
          variables: { fileName: file.name, overwrite },
          adminApi: { method: "POST", path: "/admin/uploads/import" },
        }),
      )
      try {
        const result = await importFileStorageArchive(api, file, { overwrite })
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
        toast.success(
          parts.join(" · "),
          buildFileStorageToastOptions({
            startedAt,
            operationLabel,
            variables: { fileName: file.name, overwrite },
            data: result,
            adminApi: { method: "POST", path: "/admin/uploads/import" },
            extra: { id: importToast },
          }),
        )
        if (result.failed > 0 && result.errors.length) {
          toast.error(result.errors.slice(0, 3).join("\n"), {
            copyContext: {
              storageOperation: true,
              operationLabel,
              error: result.errors,
              data: result,
            },
          })
        }
        setImportConfirm(null)
        await reload()
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Lỗi khôi phục kho lưu trữ",
          buildFileStorageToastOptions({
            startedAt,
            operationLabel,
            variables: { fileName: file.name, overwrite },
            error: err,
            adminApi: { method: "POST", path: "/admin/uploads/import" },
            extra: { id: importToast },
          }),
        )
      } finally {
        setImporting(false)
        if (importInputRef.current) importInputRef.current.value = ""
      }
    },
    [api, reload]
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
