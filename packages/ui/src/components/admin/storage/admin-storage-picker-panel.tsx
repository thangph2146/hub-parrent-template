"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react"
import type { OnChangeFn, Row, RowSelectionState } from "@tanstack/react-table"
import type { StorageRealm } from "@workspace/api-client"
import { Button } from "../../button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../tabs"
import { AdminPageLoading } from "../pages/admin-page-loading"
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "../../../lib/layout-shell"
import { toast } from "../../sonner"
import {
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Music,
  Upload,
  Video,
} from "lucide-react"
import { getAdminStoragePickerColumns } from "./admin-storage-picker-columns"
import { AdminStoragePickerTable } from "./admin-storage-picker-table"
import {
  extractStorageRelativePath,
  formatStorageDeleteError,
  isImageStorageRow,
  resolveStorageAssetUrl,
} from "./storage-asset-url"
import type {
  AdminStoragePickerAdapters,
  AdminStoragePickerFolderScope,
  AdminStoragePickerUploadConfig,
  AdminStorageFileRow,
} from "./types"
import { useAdminStoragePickerList } from "./use-admin-storage-picker-list"

const REALM_ORDER: StorageRealm[] = ["images", "files", "videos", "audio"]

const REALM_ICONS: Record<StorageRealm, typeof ImageIcon> = {
  images: ImageIcon,
  files: FileText,
  videos: Video,
  audio: Music,
}

export type AdminStoragePickerPanelProps = {
  adapters: AdminStoragePickerAdapters
  onPick: (urls: string[]) => void
  imagesOnly?: boolean
  multiSelect?: boolean
  folderScope?: AdminStoragePickerFolderScope | null
  upload?: AdminStoragePickerUploadConfig
  canDelete?: boolean
  className?: string
  onSelectionCountChange?: (count: number) => void
  confirmPickRef?: MutableRefObject<(() => void) | null>
  clearSelectionRef?: MutableRefObject<(() => void) | null>
  bulkDeleteRef?: MutableRefObject<(() => void | Promise<void>) | null>
  onDeletingBulkChange?: (deleting: boolean) => void
}

export function AdminStoragePickerPanel({
  adapters,
  onPick,
  imagesOnly = true,
  multiSelect = true,
  folderScope = null,
  upload,
  canDelete = true,
  className,
  onSelectionCountChange,
  confirmPickRef,
  clearSelectionRef,
  bulkDeleteRef,
  onDeletingBulkChange,
}: AdminStoragePickerPanelProps) {
  const locked = Boolean(folderScope)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingPath, setDeletingPath] = useState<string | null>(null)
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(
    Boolean(folderScope?.onBootstrap)
  )
  const [activeRealm, setActiveRealm] = useState<StorageRealm>(
    folderScope?.realm ?? "images"
  )
  const [activeFolderPath, setActiveFolderPath] = useState(
    folderScope?.folderPath ?? ""
  )
  const [includeDescendants, setIncludeDescendants] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [pickedMap, setPickedMap] = useState<Map<string, string>>(
    () => new Map()
  )

  const { rows, realms, loading, isFetching, total, reload } =
    useAdminStoragePickerList(
      adapters,
      activeRealm,
      activeFolderPath,
      page,
      pageSize,
      locked ? false : includeDescendants
    )

  useEffect(() => {
    if (!folderScope) return
    let cancelled = false
    void (async () => {
      setBootstrapping(true)
      try {
        const path = folderScope.onBootstrap
          ? (await folderScope.onBootstrap()).folderPath
          : folderScope.folderPath
        if (!cancelled) {
          setActiveRealm(folderScope.realm ?? "images")
          setActiveFolderPath(path)
          setPage(1)
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Không mở được folder sản phẩm"
          )
        }
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    folderScope?.folderPath,
    folderScope?.folderLabel,
    folderScope?.onBootstrap,
    folderScope?.realm,
  ])

  const realmTabs = useMemo(() => {
    const byId = new Map(realms.map((r) => [r.id, r]))
    return REALM_ORDER.map((id) => {
      const fromApi = byId.get(id)
      return (
        fromApi ?? {
          id,
          label:
            id === "images"
              ? "Hình ảnh"
              : id === "files"
                ? "Tệp tin"
                : id === "videos"
                  ? "Video"
                  : "Âm thanh",
          count: 0,
        }
      )
    })
  }, [realms])

  const currentFolderLabel = locked
    ? (folderScope?.folderLabel ?? "Sản phẩm")
    : activeFolderPath || "Kho lưu trữ"

  const canPickRow = useCallback(
    (row: AdminStorageFileRow) => !imagesOnly || isImageStorageRow(row),
    [imagesOnly]
  )

  const removeFromPicked = useCallback((relativePath: string) => {
    setPickedMap((prev) => {
      if (!prev.has(relativePath)) return prev
      const next = new Map(prev)
      next.delete(relativePath)
      return next
    })
  }, [])

  const handleDeleteRow = useCallback(
    async (row: AdminStorageFileRow) => {
      if (!canDelete || deletingPath) return
      setDeletingPath(row.relativePath)
      try {
        await adapters.deleteFile(row.relativePath)
        removeFromPicked(row.relativePath)
        toast.success("Đã xóa file khỏi kho")
        await reload()
      } catch (err) {
        const raw = err instanceof Error ? err.message : "Lỗi xóa file"
        toast.error(formatStorageDeleteError(raw))
      } finally {
        setDeletingPath(null)
      }
    },
    [adapters, canDelete, deletingPath, reload, removeFromPicked]
  )

  const handleBulkDelete = useCallback(
    async (paths: string[]) => {
      const normalized = [
        ...new Set(
          paths
            .map((p) => extractStorageRelativePath(p) ?? p.trim())
            .filter(Boolean)
        ),
      ]
      if (!canDelete || !normalized.length || deletingBulk) return
      setDeletingBulk(true)
      onDeletingBulkChange?.(true)
      const pending = toast.loading(`Đang xóa ${normalized.length} file…`)
      try {
        const result = await adapters.bulkDeleteFiles(normalized)
        const failedPaths = new Set(result.errors.map((entry) => entry.path))
        for (const path of normalized) {
          if (!failedPaths.has(path)) removeFromPicked(path)
        }
        setPickedMap((prev) => {
          const next = new Map(prev)
          for (const [key] of prev) {
            const rel = extractStorageRelativePath(key) ?? key
            if (normalized.includes(rel) && !failedPaths.has(rel)) {
              next.delete(key)
            }
          }
          return next
        })
        await reload()
        const errorHint = result.errors[0]
          ? formatStorageDeleteError(result.errors[0].message)
          : ""
        if (result.deleted > 0 && result.failed === 0) {
          toast.success(`Đã xóa ${result.deleted} file`, { id: pending })
        } else if (result.deleted > 0 && result.failed > 0) {
          toast.warning(
            `Đã xóa ${result.deleted}/${normalized.length} file. ${result.failed} file lỗi${errorHint ? `: ${errorHint}` : ""}`,
            { id: pending }
          )
        } else {
          toast.error(errorHint || "Không xóa được file nào", { id: pending })
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi xóa hàng loạt", {
          id: pending,
        })
      } finally {
        setDeletingBulk(false)
        onDeletingBulkChange?.(false)
      }
    },
    [
      adapters,
      canDelete,
      deletingBulk,
      onDeletingBulkChange,
      reload,
      removeFromPicked,
    ]
  )

  const deletePickedRows = useCallback(async () => {
    const paths = [...pickedMap.keys()]
    if (!paths.length) {
      toast.message("Chưa chọn file nào để xóa")
      return
    }
    await handleBulkDelete(paths)
  }, [handleBulkDelete, pickedMap])

  const togglePickRow = useCallback(
    (row: AdminStorageFileRow) => {
      if (!canPickRow(row)) {
        toast.message("Chỉ có thể chọn file ảnh.")
        return
      }
      const url = resolveStorageAssetUrl(row)
      if (!multiSelect) {
        onPick([url])
        return
      }
      setPickedMap((prev) => {
        const next = new Map(prev)
        if (next.has(row.relativePath)) next.delete(row.relativePath)
        else next.set(row.relativePath, url)
        return next
      })
    },
    [canPickRow, multiSelect, onPick]
  )

  const selectedRowIds = useMemo(() => {
    const state: RowSelectionState = {}
    for (const row of rows) {
      if (pickedMap.has(row.relativePath)) {
        state[row.relativePath] = true
      }
    }
    return state
  }, [pickedMap, rows])

  const handleSelectedRowIdsChange = useCallback<OnChangeFn<RowSelectionState>>(
    (updater) => {
      setPickedMap((prev) => {
        const current: RowSelectionState = {}
        for (const row of rows) {
          if (prev.has(row.relativePath)) {
            current[row.relativePath] = true
          }
        }
        const nextState =
          typeof updater === "function" ? updater(current) : updater
        const next = new Map(prev)
        for (const row of rows) {
          const id = row.relativePath
          if (nextState[id]) {
            next.set(id, resolveStorageAssetUrl(row))
          } else {
            next.delete(id)
          }
        }
        return next
      })
    },
    [rows]
  )

  const canSelectTableRow = useCallback(
    (row: Row<AdminStorageFileRow>) => canPickRow(row.original),
    [canPickRow]
  )

  const clearPicked = useCallback(() => {
    setPickedMap(new Map())
  }, [])

  const confirmPicked = useCallback(() => {
    const urls = [...pickedMap.values()]
    if (!urls.length) {
      toast.message("Chưa chọn ảnh nào")
      return
    }
    onPick(urls)
    clearPicked()
  }, [clearPicked, onPick, pickedMap])

  useEffect(() => {
    onSelectionCountChange?.(pickedMap.size)
  }, [onSelectionCountChange, pickedMap.size])

  useEffect(() => {
    if (!confirmPickRef) return
    confirmPickRef.current = multiSelect ? confirmPicked : null
    return () => {
      confirmPickRef.current = null
    }
  }, [confirmPickRef, confirmPicked, multiSelect])

  useEffect(() => {
    if (!clearSelectionRef) return
    clearSelectionRef.current = multiSelect ? clearPicked : null
    return () => {
      clearSelectionRef.current = null
    }
  }, [clearPicked, clearSelectionRef, multiSelect])

  useEffect(() => {
    if (!bulkDeleteRef) return
    bulkDeleteRef.current =
      canDelete && multiSelect ? () => deletePickedRows() : null
    return () => {
      bulkDeleteRef.current = null
    }
  }, [bulkDeleteRef, canDelete, deletePickedRows, multiSelect])

  const columns = useMemo(
    () =>
      getAdminStoragePickerColumns({
        onPick: togglePickRow,
        onDelete: canDelete ? handleDeleteRow : undefined,
        canPick: canPickRow,
        isSelected: (row) => pickedMap.has(row.relativePath),
        multiSelect,
        canDelete,
        deletingPath,
      }),
    [
      canDelete,
      canPickRow,
      deletingPath,
      handleDeleteRow,
      multiSelect,
      pickedMap,
      togglePickRow,
    ]
  )

  const runUpload = useCallback(
    async (files: File[]) => {
      if (!files.length || !upload) return
      if (upload.disabled) {
        toast.error("Nhập tên hoặc SKU sản phẩm trước khi tải ảnh lên")
        return
      }
      setUploading(true)
      const pending = toast.loading(`Đang tải lên ${files.length} ảnh…`)
      try {
        const uploadedUrls = await upload.uploadFiles(files)
        await reload()
        if (uploadedUrls.length > 0) {
          toast.success(`Đã lưu ${uploadedUrls.length} ảnh`, { id: pending })
          if (multiSelect) {
            setPickedMap((prev) => {
              const next = new Map(prev)
              for (const url of uploadedUrls) {
                const relativePath = extractStorageRelativePath(url)
                if (relativePath) next.set(relativePath, url)
                else next.set(url, url)
              }
              return next
            })
          } else {
            onPick(uploadedUrls)
          }
        } else {
          toast.error("Không tải được ảnh nào", { id: pending })
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi tải ảnh", {
          id: pending,
        })
      } finally {
        setUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    },
    [multiSelect, onPick, reload, upload]
  )

  const openUploadPicker = useCallback(() => {
    if (upload?.disabled) {
      toast.error("Nhập tên hoặc SKU sản phẩm trước khi tải ảnh lên")
      return
    }
    fileInputRef.current?.click()
  }, [upload?.disabled])

  if (bootstrapping || (loading && rows.length === 0 && !locked)) {
    return <AdminPageLoading variant="list" />
  }

  const uploadButton = upload ? (
    <Button
      type="button"
      variant="default"
      size="sm"
      className="shrink-0 gap-1.5"
      disabled={uploading || upload.disabled}
      onClick={openUploadPicker}
    >
      {uploading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Upload className="size-4" />
      )}
      {uploading ? "Đang tải…" : (upload.label ?? "Tải ảnh lên")}
    </Button>
  ) : null

  const tableBlock = (
    <AdminStoragePickerTable
      tableScope={`admin-storage-picker-${activeRealm}-${activeFolderPath || "root"}`}
      data={rows}
      columns={columns}
      isLoading={loading}
      isFetching={isFetching}
      emptyLabel={`Chưa có ảnh trong «${currentFolderLabel}».`}
      emptySummary={`Không có file trong ${currentFolderLabel}`}
      itemLabel="ảnh"
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      multiSelect={multiSelect}
      selectedRowIds={selectedRowIds}
      onSelectedRowIdsChange={handleSelectedRowIdsChange}
      canSelectRow={canSelectTableRow}
      emptyState={
        !loading && rows.length === 0 && upload ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-10 text-center">
            <FolderOpen className="size-10 text-muted-foreground" />
            <p className="text-sm font-medium">Chưa có ảnh trong folder này</p>
            <p className="text-xs text-muted-foreground">
              Tải ảnh lên hoặc chọn từ kho sau khi đã có file
            </p>
            {uploadButton}
          </div>
        ) : undefined
      }
    />
  )

  return (
    <div className={className}>
      {locked && folderScope ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">
                {folderScope.parentLabel ?? "Sản phẩm"} /{" "}
                {folderScope.folderLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                Chỉ hiển thị ảnh trong folder sản phẩm đang chỉnh sửa.
                {multiSelect
                  ? " Tick nhiều ảnh rồi «Xác nhận» — hoặc xóa file khỏi kho bằng nút Xóa."
                  : ""}
              </p>
            </div>
            {uploadButton}
          </div>
          {upload ? (
            <input
              ref={fileInputRef}
              type="file"
              accept={upload.accept ?? "image/*"}
              multiple
              className="hidden"
              onChange={(e) => {
                void runUpload(Array.from(e.target.files ?? []))
              }}
            />
          ) : null}
          {tableBlock}
        </div>
      ) : (
        <Tabs
          value={activeRealm}
          onValueChange={(value) => {
            setActiveRealm(value as StorageRealm)
            setActiveFolderPath("")
            setPage(1)
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className={`${ADMIN_LIST_TABS_LIST_CLASS} flex-wrap`}>
              {realmTabs.map((realm) => {
                const Icon = REALM_ICONS[realm.id as StorageRealm] ?? ImageIcon
                return (
                  <TabsTrigger
                    key={realm.id}
                    value={realm.id}
                    className={ADMIN_LIST_TABS_TRIGGER_CLASS}
                  >
                    <Icon className="size-4" />
                    {realm.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            <p className="w-full text-xs text-muted-foreground">
              {imagesOnly
                ? multiSelect
                  ? "Tick nhiều ảnh, «Xác nhận» ở cuối dialog — có thể xóa file khỏi kho."
                  : "Bấm «Chọn» để gán ảnh."
                : "Duyệt kho lưu trữ."}
            </p>
          </div>
          {realmTabs.map((realm) => (
            <TabsContent key={realm.id} value={realm.id} className="space-y-4">
              {activeRealm === realm.id ? tableBlock : null}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
