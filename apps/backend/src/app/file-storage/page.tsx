"use client";

import { useCallback, useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageLoading,
  AdminPageSection,
} from "@ui/components/admin";
import { ImageLightbox } from "@ui/components/image-lightbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import {
  ADMIN_LIST_TABS_LIST_CLASS,
  ADMIN_LIST_TABS_TRIGGER_CLASS,
} from "@ui/lib/layout-shell";
import { canUserAccess, PERMISSION_CODES } from "@workspace/api-client";
import { useAuth } from "@/providers/auth-provider";
import {
  ArchiveRestore,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Shuffle,
  Upload,
  Video,
  Music,
} from "lucide-react";
import {
  formatExtensionsSummary,
  getRealmDefaultExtensions,
} from "./_component/storage-upload-policy";
import {
  FileStorageCreateFolderButton,
  FileStorageDeleteFolderButton,
  FileStorageFolderNav,
  FileStorageGlobalEmpty,
  FileStorageImportConfirmDialogs,
  FileStorageMoveDialog,
  FileStorageReorganizeDialog,
  FileStorageTable,
  FileStorageUploadDialog,
  getFileStorageColumns,
  StorageVideoPreview,
  useFileStorageActions,
  useFileStorageList,
  type FileStorageRow,
  type StorageRealm,
} from "./_component";
import {
  isImageStorageRow,
  resolveStorageAssetUrl,
  resolveFolderPathAfterCreate,
} from "./_component/utils";

const REALM_ORDER: StorageRealm[] = ["images", "files", "videos", "audio"];

const REALM_ICONS: Record<StorageRealm, typeof ImageIcon> = {
  images: ImageIcon,
  files: FileText,
  videos: Video,
  audio: Music,
};

function FileStoragePageInner() {
  const { user } = useAuth();
  const canUpload = user
    ? canUserAccess(user, PERMISSION_CODES.UPLOADS_CREATE) ||
      canUserAccess(user, PERMISSION_CODES.UPLOADS_MANAGE)
    : false;
  const canDelete = user
    ? canUserAccess(user, PERMISSION_CODES.UPLOADS_DELETE) ||
      canUserAccess(user, PERMISSION_CODES.UPLOADS_MANAGE)
    : false;
  const canView = user
    ? canUserAccess(user, PERMISSION_CODES.UPLOADS_VIEW) ||
      canUserAccess(user, PERMISSION_CODES.UPLOADS_MANAGE)
    : false;
  const canManage = user
    ? canUserAccess(user, PERMISSION_CODES.UPLOADS_MANAGE)
    : false;

  const [reorganizeOpen, setReorganizeOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveRows, setMoveRows] = useState<FileStorageRow[]>([]);

  const [activeRealm, setActiveRealm] = useState<StorageRealm>("images");
  const [activeFolderPath, setActiveFolderPath] = useState("");
  const [includeDescendants, setIncludeDescendants] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoPreviewRow, setVideoPreviewRow] = useState<FileStorageRow | null>(
    null,
  );

  const { rows, realms, childFolders, breadcrumb, loading, total, reload } =
    useFileStorageList(
      activeRealm,
      activeFolderPath,
      page,
      pageSize,
      includeDescendants,
    );

  const totalInStorage = useMemo(
    () => realms.reduce((sum, realm) => sum + realm.count, 0),
    [realms],
  );

  const realmTabs = useMemo(() => {
    const byId = new Map(realms.map((r) => [r.id, r]));
    return REALM_ORDER.map((id) => {
      const fromApi = byId.get(id);
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
      );
    });
  }, [realms]);

  const {
    uploadDialogOpen,
    setUploadDialogOpen,
    setUploading,
    importInputRef,
    uploading,
    importing,
    deletingPath,
    downloadingPath,
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
    downloadingAll,
    handleDelete,
    handleBulkDelete,
    handleDeleteAllInTab,
    fetchAllRowsInScope,
    openUploadPicker,
    openImportPicker,
  } = useFileStorageActions({
    activeRealm,
    activeFolderPath,
    includeDescendants,
    reload,
  });

  const activeRealmMeta = realmTabs.find((r) => r.id === activeRealm);
  const currentFolderLabel =
    breadcrumb[breadcrumb.length - 1]?.label ??
    activeRealmMeta?.label ??
    activeRealm;
  const activeTabLabel = breadcrumb.length
    ? `${activeRealmMeta?.label ?? activeRealm} · ${breadcrumb.map((c) => c.label).join(" / ")}`
    : activeRealmMeta?.label;

  const realmUploadHint = useMemo(
    () => formatExtensionsSummary(getRealmDefaultExtensions(activeRealm)),
    [activeRealm],
  );

  const lightboxImages = useMemo(
    () =>
      rows
        .filter((r) => isImageStorageRow(r))
        .map((r) => ({
          key: r.relativePath,
          src: resolveStorageAssetUrl(r),
          altText: r.originalName,
        })),
    [rows],
  );

  const openImagePreview = useCallback(
    (row: FileStorageRow) => {
      const idx = lightboxImages.findIndex((li) => li.key === row.relativePath);
      if (idx >= 0) {
        setLightboxIndex(idx);
        setLightboxOpen(true);
      }
    },
    [lightboxImages],
  );

  const openVideoPreview = useCallback((row: FileStorageRow) => {
    setVideoPreviewRow(row);
  }, []);

  const handleRealmChange = useCallback((value: string) => {
    setActiveRealm(value as StorageRealm);
    setActiveFolderPath("");
    setPage(1);
    setSelectedRowIds({});
  }, []);

  const handleFolderNavigate = useCallback((folderPath: string) => {
    setActiveFolderPath(folderPath);
    setPage(1);
    setSelectedRowIds({});
  }, []);

  const handleFolderCreated = useCallback(
    async (folderPath: string) => {
      setActiveFolderPath(resolveFolderPathAfterCreate(folderPath, activeRealm));
      setPage(1);
      setSelectedRowIds({});
      await reload();
    },
    [activeRealm, reload],
  );

  const handleFolderDeleted = useCallback(async () => {
    const parentPath =
      breadcrumb.length >= 2
        ? breadcrumb[breadcrumb.length - 2].id
        : "";
    setActiveFolderPath(parentPath);
    setPage(1);
    setSelectedRowIds({});
    await reload();
  }, [breadcrumb, reload]);

  const handleBulkMove = useCallback((selected: FileStorageRow[]) => {
    setMoveRows(selected);
    setMoveDialogOpen(true);
  }, []);

  const handleMoveCompleted = useCallback(async () => {
    setSelectedRowIds({});
    await reload();
  }, [reload]);

  const handleMoveAllInScope = useCallback(async () => {
    const allRows = await fetchAllRowsInScope();
    if (!allRows.length) return;
    setMoveRows(allRows);
    setMoveDialogOpen(true);
  }, [fetchAllRowsInScope]);

  const handleIncludeDescendantsChange = useCallback((value: boolean) => {
    setIncludeDescendants(value);
    setPage(1);
    setSelectedRowIds({});
  }, []);

  const columns = useMemo(
    () =>
      getFileStorageColumns({
        canDelete,
        deletingPath,
        downloadingPath,
        onPreviewImage: openImagePreview,
        onPreviewVideo: openVideoPreview,
        onDownload: handleDownload,
        onDelete: handleDelete,
      }),
    [
      canDelete,
      deletingPath,
      downloadingPath,
      handleDelete,
      handleDownload,
      openImagePreview,
      openVideoPreview,
    ],
  );

  const wrappedBulkDelete = useCallback(
    async (selected: FileStorageRow[]) => {
      await handleBulkDelete(selected);
      setSelectedRowIds({});
    },
    [handleBulkDelete],
  );

  const tableProps = {
    data: rows,
    columns,
    isLoading: loading,
    itemLabel: "file" as const,
    page,
    pageSize,
    total,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    selectedRowIds,
    onSelectedRowIdsChange: setSelectedRowIds,
    onBulkDelete: wrappedBulkDelete,
    onBulkDownload: handleBulkDownload,
    onBulkMove: canManage ? handleBulkMove : undefined,
    onMoveAllInScope: canManage ? handleMoveAllInScope : undefined,
    onDeleteAllInTab: canDelete ? handleDeleteAllInTab : undefined,
    includeDescendants,
    canDelete,
    canUpload,
    uploading,
    onUpload: openUploadPicker,
  };

  return (
    <AdminPageSection>
      <AdminListPageHeader
        icon={ImageIcon}
        title="Kho lưu trữ file"
        subtitle="Điều hướng folder không giới hạn cấp. Di chuyển file giữa Hình ảnh / Tệp tin / Video. Tạo hoặc xóa folder theo phạm vi đang mở."
        actions={
          canUpload || canView ? (
            <div className="flex items-center gap-2">
              {canUpload ? (
                <>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".zip,application/zip"
                    className="hidden"
                    onChange={(e) => void handleImport(e)}
                  />
                  <Button
                    type="button"
                    onClick={openUploadPicker}
                    disabled={uploading || importing || downloadingAll}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {uploading ? "Đang tải…" : "Tải lên"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openImportPicker}
                    disabled={uploading || importing || downloadingAll}
                  >
                    {importing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ArchiveRestore className="size-4" />
                    )}
                    {importing ? "Đang khôi phục…" : "Khôi phục kho"}
                  </Button>
                </>
              ) : null}
              {canManage ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReorganizeOpen(true)}
                  disabled={downloadingAll || uploading || importing}
                >
                  <Shuffle className="size-4" />
                  Cấu trúc lại folder
                </Button>
              ) : null}
              {canView ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDownloadAll()}
                  disabled={downloadingAll || uploading || importing}
                >
                  {downloadingAll ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {downloadingAll ? "Đang tải…" : "Tải về tất cả"}
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />

      {loading && totalInStorage === 0 && realms.length === 0 ? (
        <AdminPageLoading variant="list" />
      ) : !loading && totalInStorage === 0 ? (
        <FileStorageGlobalEmpty
          canUpload={canUpload}
          uploading={uploading}
          importing={importing}
          onUpload={openUploadPicker}
          onImport={openImportPicker}
        />
      ) : (
        <Tabs value={activeRealm} onValueChange={handleRealmChange}>
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className={`${ADMIN_LIST_TABS_LIST_CLASS} flex-wrap`}>
              {realmTabs.map((realm) => {
                const Icon = REALM_ICONS[realm.id as StorageRealm] ?? ImageIcon;
                return (
                  <TabsTrigger
                    key={realm.id}
                    value={realm.id}
                    className={ADMIN_LIST_TABS_TRIGGER_CLASS}
                  >
                    <Icon className="size-4" />
                    {realm.label}
                    <span className="text-muted-foreground">
                      ({realm.count})
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <p className="w-full text-xs text-muted-foreground">
              Tab «{activeRealmMeta?.label ?? activeRealm}»: cho phép import{" "}
              {realmUploadHint}. Folder cấp 1 có thể tùy chỉnh khi tạo mới.
            </p>
          </div>

          {realmTabs.map((realm) => (
            <TabsContent key={realm.id} value={realm.id} className="space-y-4">
              {activeRealm === realm.id ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <FileStorageFolderNav
                      realmLabel={realm.label}
                      breadcrumb={breadcrumb}
                      childFolders={childFolders}
                      activeFolderPath={activeFolderPath}
                      includeDescendants={includeDescendants}
                      onIncludeDescendantsChange={handleIncludeDescendantsChange}
                      onNavigate={handleFolderNavigate}
                      className="min-w-0 flex-1"
                    />
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {canUpload ? (
                        <FileStorageCreateFolderButton
                          realm={activeRealm}
                          parentFolderPath={activeFolderPath}
                          parentLabel={currentFolderLabel}
                          onCreated={handleFolderCreated}
                          disabled={uploading || importing}
                        />
                      ) : null}
                      {canDelete && activeFolderPath ? (
                        <FileStorageDeleteFolderButton
                          realm={activeRealm}
                          folderPath={activeFolderPath}
                          folderLabel={currentFolderLabel}
                          onDeleted={handleFolderDeleted}
                          disabled={uploading || importing}
                        />
                      ) : null}
                    </div>
                  </div>
                  <FileStorageTable
                    tableScope={`file-storage-${realm.id}-${activeFolderPath || "root"}`}
                    emptyLabel={`Chưa có file trong «${currentFolderLabel}».`}
                    emptySummary={`Không có file trong ${currentFolderLabel}`}
                    tabLabel={currentFolderLabel}
                    {...tableProps}
                  />
                </div>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
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

      {canManage ? (
        <FileStorageReorganizeDialog
          open={reorganizeOpen}
          onOpenChange={setReorganizeOpen}
          realm={activeRealm}
          activeFolderPath={activeFolderPath}
          scopeLabel={activeTabLabel ?? activeRealmMeta?.label ?? activeRealm}
          onCompleted={reload}
        />
      ) : null}

      {canManage ? (
        <FileStorageMoveDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          selectedRows={moveRows}
          onMoved={handleMoveCompleted}
        />
      ) : null}

      {canUpload ? (
        <FileStorageImportConfirmDialogs
          state={importConfirm}
          importing={importing}
          onClose={clearImportConfirm}
          onConfirmRestore={handleImportConfirmRestore}
          onConfirmOverwrite={handleImportConfirmOverwrite}
          onSkipOverwrite={handleImportSkipOverwrite}
        />
      ) : null}

      {canUpload ? (
        <FileStorageUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          activeRealm={activeRealm}
          activeFolderPath={activeFolderPath}
          activeTabLabel={activeTabLabel}
          uploadAccept={uploadAccept}
          onUploaded={reload}
          onUploadingChange={setUploading}
        />
      ) : null}
    </AdminPageSection>
  );
}

export default function FileStoragePage() {
  return (
    <AdminPageGuard permission="uploads:view">
      <FileStoragePageInner />
    </AdminPageGuard>
  );
}
