"use client"

import Link from "next/link"
import { useCallback, useMemo, useState, type ReactNode } from "react"
import type { ColumnFiltersState, OnChangeFn, RowSelectionState } from "@tanstack/react-table"
import { Button, buttonVariants } from "@ui/components/button"
import { AdminPageLoading, AdminPermissionDeniedNotice } from "@ui/components/admin"
import { ImageLightbox } from "@ui/components/image-lightbox"
import type { DataTableUserSearchHandlers } from "@ui/components/data-table"
import { ExternalLink, Loader2, Upload } from "lucide-react"
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client"
import { useDebouncedValue } from "@workspace/admin-app/hooks/use-debounced-value"
import { normalizeAdminFilterValue } from "@workspace/admin-app/lib/build-admin-filter-query"
import { useAdminAuth as useAuth, useAdminModulePath, useAdminApi } from "@workspace/admin-app/runtime"
import { cn } from "@ui/lib/utils"
import {
  FileStorageCreateFolderButton,
} from "./file-storage-create-folder-button"
import { FileStorageDeleteFolderButton } from "./file-storage-delete-folder-button"
import { FileStorageFolderNav } from "./file-storage-folder-nav"
import { FileStorageUploadDialog } from "../dialogs/file-storage-upload-dialog"
import { StorageVideoPreview } from "./storage-video-preview"
import { getFileStorageColumns } from "../_table/columns"
import { FileStorageTable } from "../_table"
import { useFileStorageActions, useFileStorageList } from "../_hooks"
import type { FileStorageRow, StorageRealm } from "../shared/types"
import {
  clampFolderPath,
  normalizeFolderPath,
  scopeFolderBreadcrumb,
} from "../shared/folder-domain"
import {
  isImageStorageRow,
  resolveFolderPathAfterCreate,
  resolveStorageAssetUrl,
} from "../shared/utils"

const UPLOAD_OWNER_FILTER_DEBOUNCE_MS = 400

export type FileStorageScopedBrowseProps = {
  realm?: StorageRealm
  /** Folder gốc trong realm (vd. `avatars` → `images/avatars/{MSSV}`). */
  rootFolderPath?: string
  rootFolderLabel?: string
  description?: ReactNode
  tableScopePrefix?: string
  className?: string
  showUpload?: boolean
  showLinkToFullPage?: boolean
}

export function FileStorageScopedBrowse({
  realm = "images",
  rootFolderPath = "",
  rootFolderLabel,
  description,
  tableScopePrefix = "scoped",
  className,
  showUpload = true,
  showLinkToFullPage = true,
}: FileStorageScopedBrowseProps) {
  const api = useAdminApi()
  const { user } = useAuth()
  const fileStoragePath = useAdminModulePath("file-storage")
  const root = normalizeFolderPath(rootFolderPath)

  const canUpload = user
    ? canUserAccess(user, PERMISSION_CODES.UPLOADS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.UPLOADS_MANAGE)
    : false
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.UPLOADS_DELETE) ||
      canUserAccess(user, PERMISSION_CODES.UPLOADS_MANAGE)
    : false
  const canView = user
    ? canUserAccess(user, PERMISSION_CODES.UPLOADS_VIEW) ||
      canUserAccess(user, PERMISSION_CODES.UPLOADS_MANAGE)
    : false

  const [activeFolderPath, setActiveFolderPath] = useState(root)
  const [includeDescendants, setIncludeDescendants] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({})
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [videoPreviewRow, setVideoPreviewRow] = useState<FileStorageRow | null>(
    null
  )
  const [folderRefreshKey, setFolderRefreshKey] = useState(0)

  const bumpFolderList = useCallback(() => {
    setFolderRefreshKey((key) => key + 1)
  }, [])

  const uploadOwnerFilter = useMemo(() => {
    const raw = columnFilters.find((f) => f.id === "uploadOwnerId")?.value
    return normalizeAdminFilterValue(raw) ?? ""
  }, [columnFilters])

  const debouncedUploadOwnerFilter = useDebouncedValue(
    uploadOwnerFilter,
    UPLOAD_OWNER_FILTER_DEBOUNCE_MS
  )

  const {
    rows,
    childFolders,
    breadcrumb,
    loading,
    isFetching,
    total,
    reload,
  } = useFileStorageList(
    realm,
    activeFolderPath,
    page,
    pageSize,
    includeDescendants,
    debouncedUploadOwnerFilter
  )

  const scopedBreadcrumb = useMemo(
    () => scopeFolderBreadcrumb(breadcrumb, root),
    [breadcrumb, root]
  )

  const navRealmLabel = root
    ? (rootFolderLabel ?? root.split("/").pop() ?? root)
    : realm === "images"
      ? "Hình ảnh"
      : realm

  const currentFolderLabel =
    scopedBreadcrumb[scopedBreadcrumb.length - 1]?.label ?? navRealmLabel

  const {
    uploadDialogOpen,
    setUploadDialogOpen,
    setUploading,
    uploading,
    deletingPath,
    downloadingPath,
    handleDownload,
    handleDelete,
    handleBulkDelete,
    handleBulkDownload,
    openUploadPicker,
  } = useFileStorageActions({
    activeRealm: realm,
    activeFolderPath,
    includeDescendants,
    uploadOwnerFilter: debouncedUploadOwnerFilter,
    reload,
  })

  const lightboxImages = useMemo(
    () =>
      rows
        .filter((r) => isImageStorageRow(r))
        .map((r) => ({
          key: r.relativePath,
          src: resolveStorageAssetUrl(r),
          altText: r.originalName,
        })),
    [rows]
  )

  const openImagePreview = useCallback(
    (row: FileStorageRow) => {
      const idx = lightboxImages.findIndex((li) => li.key === row.relativePath)
      if (idx >= 0) {
        setLightboxIndex(idx)
        setLightboxOpen(true)
      }
    },
    [lightboxImages]
  )

  const handleFolderNavigate = useCallback(
    (folderPath: string) => {
      setActiveFolderPath(clampFolderPath(folderPath, root))
      setPage(1)
      setSelectedRowIds({})
    },
    [root]
  )

  const handleFolderCreated = useCallback(
    async (folderPath: string) => {
      setActiveFolderPath(
        clampFolderPath(resolveFolderPathAfterCreate(folderPath, realm), root)
      )
      setPage(1)
      setSelectedRowIds({})
      bumpFolderList()
      await reload()
    },
    [bumpFolderList, realm, reload, root]
  )

  const handleFolderDeleted = useCallback(async () => {
    const parentPath =
      scopedBreadcrumb.length >= 2
        ? (scopedBreadcrumb.at(-2)?.id ?? root)
        : root
    setActiveFolderPath(parentPath)
    setPage(1)
    setSelectedRowIds({})
    bumpFolderList()
    await reload()
  }, [bumpFolderList, reload, root, scopedBreadcrumb])

  const handleIncludeDescendantsChange = useCallback((value: boolean) => {
    setIncludeDescendants(value)
    setPage(1)
    setSelectedRowIds({})
  }, [])

  const handleColumnFiltersChange = useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      setColumnFilters(updater)
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setColumnFilters([])
    setPage(1)
    setSelectedRowIds({})
  }, [])

  const uploadOwnerSearchHandlers = useMemo<DataTableUserSearchHandlers>(
    () => ({
      onSearch: async (q) => {
        const res = await api.users.list({ q, page: 1, limit: 10 })
        return res.items.map((item) => ({
          id: item.id,
          label: item.fullName?.trim() || item.email,
          sublabel: item.email,
        }))
      },
      onResolveUser: async (id) => {
        const item = await api.users.get(id)
        return {
          id: item.id,
          label: item.fullName?.trim() || item.email,
          sublabel: item.email,
        }
      },
    }),
    [api]
  )

  const columns = useMemo(
    () =>
      getFileStorageColumns({
        canDelete,
        deletingPath,
        downloadingPath,
        onPreviewImage: openImagePreview,
        onPreviewVideo: (row) => setVideoPreviewRow(row),
        onDownload: handleDownload,
        onDelete: handleDelete,
        uploadOwnerSearchHandlers,
      }),
    [
      canDelete,
      deletingPath,
      downloadingPath,
      handleDelete,
      handleDownload,
      openImagePreview,
      uploadOwnerSearchHandlers,
    ]
  )

  const wrappedBulkDelete = useCallback(
    async (selected: FileStorageRow[]) => {
      await handleBulkDelete(selected)
      setSelectedRowIds({})
    },
    [handleBulkDelete]
  )

  if (!canView) {
    if (!user) return null
    return (
      <AdminPermissionDeniedNotice
        user={user}
        actionLabel="Xem kho lưu trữ tệp"
        requiredPermission={PERMISSION_CODES.UPLOADS_VIEW}
        fallback={
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Bạn không có quyền xem kho lưu trữ.
          </p>
        }
      />
    )
  }

  return (
    <div className={className}>
      {(description || showLinkToFullPage) && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2 text-sm text-muted-foreground">
          {description ? <div className="min-w-0 flex-1">{description}</div> : null}
          {showLinkToFullPage ? (
            <Link
              href={
                root
                  ? `${fileStoragePath()}?realm=${realm}&folder=${encodeURIComponent(root)}`
                  : fileStoragePath()
              }
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 shrink-0 gap-1.5")}
            >
              <ExternalLink className="size-3.5" />
              Mở kho đầy đủ
            </Link>
          ) : null}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <AdminPageLoading variant="list" />
      ) : (
        <div className="space-y-4">
          <FileStorageFolderNav
            realm={realm}
            realmLabel={navRealmLabel}
            breadcrumb={scopedBreadcrumb}
            childFolders={childFolders}
            activeFolderPath={activeFolderPath}
            includeDescendants={includeDescendants}
            onIncludeDescendantsChange={handleIncludeDescendantsChange}
            onNavigate={handleFolderNavigate}
            foldersRefreshKey={folderRefreshKey}
            homeFolderPath={root || undefined}
            actions={
              <>
                {showUpload && canUpload ? (
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={openUploadPicker}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    Tải lên
                  </Button>
                ) : null}
                {canUpload ? (
                  <FileStorageCreateFolderButton
                    realm={realm}
                    parentFolderPath={activeFolderPath}
                    parentLabel={currentFolderLabel}
                    onCreated={handleFolderCreated}
                    disabled={uploading}
                  />
                ) : null}
                {canDelete && activeFolderPath && activeFolderPath !== root ? (
                  <FileStorageDeleteFolderButton
                    realm={realm}
                    folderPath={activeFolderPath}
                    folderLabel={currentFolderLabel}
                    onDeleted={handleFolderDeleted}
                    disabled={uploading}
                  />
                ) : null}
              </>
            }
          />

          <FileStorageTable
            tableScope={`${tableScopePrefix}-${realm}-${activeFolderPath || "root"}`}
            emptyLabel={`Chưa có file trong «${currentFolderLabel}».`}
            emptySummary={`Không có file trong ${currentFolderLabel}`}
            tabLabel={currentFolderLabel}
            data={rows}
            columns={columns}
            isLoading={loading}
            isFetching={isFetching}
            itemLabel="file"
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={setSelectedRowIds}
            onBulkDelete={canDelete ? wrappedBulkDelete : async () => {}}
            onBulkDownload={handleBulkDownload}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            onClearFilters={handleClearFilters}
            includeDescendants={includeDescendants}
            canDelete={canDelete}
            canUpload={showUpload && canUpload}
            uploading={uploading}
            onUpload={openUploadPicker}
          />
        </div>
      )}

      <ImageLightbox
        open={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />

      <StorageVideoPreview
        row={videoPreviewRow}
        open={videoPreviewRow != null}
        onClose={() => setVideoPreviewRow(null)}
      />

      {showUpload && canUpload ? (
        <FileStorageUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          activeRealm={realm}
          activeFolderPath={activeFolderPath}
          activeTabLabel={currentFolderLabel}
          uploadAccept="image/*"
          onUploaded={reload}
          onUploadingChange={setUploading}
        />
      ) : null}
    </div>
  )
}
