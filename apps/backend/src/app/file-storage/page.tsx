"use client";

import { useCallback, useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import {
  AdminListPageHeader,
  AdminPageGuard,
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
  File,
  FileImage,
  Image as ImageIcon,
  Loader2,
  Upload,
} from "lucide-react";
import {
  FileStorageTable,
  getFileStorageColumns,
  useFileStorageActions,
  useFileStorageList,
  type FileStorageRow,
  type FileStorageTab,
} from "./_component";
import { isImageMime } from "./_component/utils";

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

  const [activeTab, setActiveTab] = useState<FileStorageTab>("images");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { rows, loading, total, reload } = useFileStorageList(
    activeTab,
    page,
    pageSize,
  );

  const {
    fileInputRef,
    importInputRef,
    uploading,
    importing,
    deletingPath,
    downloadingPath,
    uploadAccept,
    handleUpload,
    handleImport,
    handleDownload,
    handleDownloadAll,
    handleBulkDownload,
    downloadingAll,
    handleDelete,
    handleBulkDelete,
    openUploadPicker,
    openImportPicker,
  } = useFileStorageActions({ activeTab, reload });

  const isImagesTab = activeTab === "images";

  const lightboxImages = useMemo(
    () =>
      rows
        .filter((r) => isImageMime(r.mimeType))
        .map((r) => ({
          key: r.relativePath,
          src: r.url,
          altText: r.originalName,
        })),
    [rows],
  );

  const openPreview = useCallback(
    (row: FileStorageRow) => {
      const idx = lightboxImages.findIndex((li) => li.key === row.relativePath);
      if (idx >= 0) {
        setLightboxIndex(idx);
        setLightboxOpen(true);
      }
    },
    [lightboxImages],
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as FileStorageTab);
    setPage(1);
    setSelectedRowIds({});
  }, []);

  const columns = useMemo(
    () =>
      getFileStorageColumns({
        isImagesTab,
        canDelete,
        deletingPath,
        downloadingPath,
        onPreview: openPreview,
        onDownload: handleDownload,
        onDelete: handleDelete,
      }),
    [
      canDelete,
      deletingPath,
      downloadingPath,
      handleDelete,
      handleDownload,
      isImagesTab,
      openPreview,
    ],
  );

  const wrappedBulkDelete = useCallback(
    async (selected: FileStorageRow[]) => {
      await handleBulkDelete(selected);
      setSelectedRowIds({});
    },
    [handleBulkDelete],
  );

  return (
    <AdminPageSection>
      <AdminListPageHeader
        icon={ImageIcon}
        title="Kho lưu trữ file"
        subtitle="Quản lý, sao lưu và khôi phục tệp tin, hình ảnh đã tải lên"
        actions={
          canUpload || canView ? (
            <div className="flex items-center gap-2">
              {canUpload ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={uploadAccept}
                    className="hidden"
                    onChange={(e) => void handleUpload(e)}
                  />
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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className={ADMIN_LIST_TABS_LIST_CLASS}>
          <TabsTrigger value="images" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            <FileImage className="size-4" />
            Hình ảnh
          </TabsTrigger>
          <TabsTrigger value="files" className={ADMIN_LIST_TABS_TRIGGER_CLASS}>
            <File className="size-4" />
            Tệp tin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          <FileStorageTable
            tableScope="file-storage-images"
            data={rows}
            columns={columns}
            isLoading={loading}
            emptyLabel='Chưa có hình ảnh nào — bấm "Tải lên" để thêm.'
            itemLabel="hình ảnh"
            emptySummary="Không có hình ảnh"
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={setSelectedRowIds}
            onBulkDelete={wrappedBulkDelete}
            onBulkDownload={handleBulkDownload}
            canDelete={canDelete}
          />
        </TabsContent>

        <TabsContent value="files">
          <FileStorageTable
            tableScope="file-storage-files"
            data={rows}
            columns={columns}
            isLoading={loading}
            emptyLabel='Chưa có tệp tin nào — bấm "Tải lên" để thêm.'
            itemLabel="tệp tin"
            emptySummary="Không có tệp tin"
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={setSelectedRowIds}
            onBulkDelete={wrappedBulkDelete}
            onBulkDownload={handleBulkDownload}
            canDelete={canDelete}
          />
        </TabsContent>
      </Tabs>

      <ImageLightbox
        open={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
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
