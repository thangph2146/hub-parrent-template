"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@ui/components/button";
import { Badge } from "@ui/components/badge";
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin";
import {
  AdminDataTable,
  adminTableRowSelectionProps,
  type AdminDataTableBulkAction,
} from "@ui/components/data-table";
import { ImageLightbox } from "@ui/components/image-lightbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@ui/components/tabs";
import { FileTypeIcon, FileTypeIconSm } from "@ui/components/file-type-icon";
import { Image as ImageIcon, Loader2, Trash2, Upload, File, FileImage } from "lucide-react";
import { uploadAdminImage } from "@/lib/admin-upload";
import { fetchImages, deleteUploadedFile } from "@/lib/admin-uploads";
import type { ImageItem } from "@/lib/admin-uploads";
import { formatAdminDateTime } from "@/lib/format-admin-datetime";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mime: string): boolean {
  return mime.startsWith("image/");
}

function getShortType(mime: string): string {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "application/zip": "ZIP",
    "application/x-rar-compressed": "RAR",
    "application/x-7z-compressed": "7Z",
    "text/plain": "TXT",
    "text/csv": "CSV",
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "image/webp": "WebP",
    "image/svg+xml": "SVG",
    "video/mp4": "MP4",
    "video/webm": "WebM",
    "audio/mpeg": "MP3",
  };
  return map[mime] || mime.split("/").pop()!.toUpperCase();
}

export default function FileStoragePage() {
  const [rows, setRows] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<RowSelectionState>({});
  const [activeTab, setActiveTab] = useState<'images' | 'files'>('images');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchImages(page, pageSize, activeTab);
      setRows(data.data);
      setTotal(data.pagination.total);
      setSelectedRowIds({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải danh sách");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab]);

  const lightboxImages = useMemo(
    () =>
      rows
        .filter((r) => isImage(r.mimeType))
        .map((r) => ({
          key: r.relativePath,
          src: r.url,
          altText: r.originalName,
        })),
    [rows],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'images' | 'files');
    setPage(1);
  }, []);

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
      load();
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [load],
  );

  const handleDelete = useCallback(
    async (relativePath: string) => {
      if (deleting) return;
      setDeleting(relativePath);
      try {
        await deleteUploadedFile(relativePath);
        toast.success("Đã xóa file");
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi xóa file");
      } finally {
        setDeleting(null);
      }
    },
    [load, deleting],
  );

  const handleBulkDelete = useCallback(
    async (selectedRows: ImageItem[]) => {
      const paths = selectedRows.map((r) => r.relativePath);
      if (!paths.length) return;
      try {
        await Promise.all(paths.map((p) => deleteUploadedFile(p)));
        toast.success(`Đã xóa ${paths.length} file`);
        setSelectedRowIds({});
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Lỗi xóa hàng loạt");
      }
    },
    [load],
  );

  const bulkActions: AdminDataTableBulkAction<ImageItem>[] = [
    {
      id: "delete-selected",
      label: "Xóa",
      icon: <Trash2 className="size-4" />,
      onAction: handleBulkDelete,
      variant: "destructive",
    },
  ];

  const isImagesTab = activeTab === 'images';

  const columns: ColumnDef<ImageItem>[] = [
    {
      id: "preview",
      header: "Xem trước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 80,
      meta: { className: "w-[180px] min-w-[180px] max-w-[180px]" },
      cell: ({ row }) =>
        isImagesTab ? (
          <button
            type="button"
            onClick={() => {
              const idx = lightboxImages.findIndex(
                (li) => li.key === row.original.relativePath,
              );
              if (idx >= 0) {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }
            }}
            className="flex size-full cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border bg-muted"
          >
            <img
              src={row.original.url}
              alt={row.original.originalName}
              className="size-full object-cover"
              loading="lazy"
            />
          </button>
        ) : (
          <FileTypeIcon filename={row.original.originalName} />
        ),
    },
    {
      accessorKey: "originalName",
      header: "Tên file",
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ getValue, row }) => (
        <div className="flex min-w-0 items-center gap-2">
          {isImagesTab ? <FileImage className="size-4 shrink-0 text-muted-foreground/60" /> : <FileTypeIconSm filename={row.original.originalName} />}
          <a
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium underline-offset-2 hover:underline"
            title={row.original.originalName}
          >
            {String(getValue())}
          </a>
        </div>
      ),
    },
    {
      accessorKey: "size",
      header: "Kích thước",
      enableSorting: false,
      enableColumnFilter: false,
      size: 120,
      meta: { className: "w-[120px] min-w-[120px] max-w-[120px]" },
      cell: ({ getValue }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatFileSize(getValue() as number)}
        </span>
      ),
    },
    {
      accessorKey: "mimeType",
      header: "Loại",
      enableSorting: false,
      enableColumnFilter: false,
      size: 100,
      meta: { className: "w-[100px] min-w-[100px] max-w-[100px]" },
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {getShortType(String(getValue()))}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tải lên",
      enableSorting: false,
      enableColumnFilter: false,
      size: 180,
      meta: { className: "w-[180px] min-w-[180px] max-w-[180px]" },
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatAdminDateTime(getValue() as number | string)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      enableSorting: false,
      enableColumnFilter: false,
      size: 80,
      meta: { className: "w-[80px] min-w-[80px] max-w-[80px]" },
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => handleDelete(row.original.relativePath)}
          disabled={deleting === row.original.relativePath}
          title="Xóa file"
        >
          {deleting === row.original.relativePath ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      ),
    },
  ];

  return (
    <AdminPageGuard permission="uploads:view">
      <AdminPageSection>
        <AdminListPageHeader
          icon={ImageIcon}
          title="Kho lưu trữ file"
          subtitle="Quản lý tệp tin, hình ảnh đã tải lên"
          actions={
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={isImagesTab ? "image/*" : "application/pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.mp4,.webm,image/*"}
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {uploading ? "Đang tải…" : "Tải lên"}
              </Button>
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="images">
              <FileImage className="size-4" />
              Hình ảnh
            </TabsTrigger>
            <TabsTrigger value="files">
              <File className="size-4" />
              Tệp tin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images">
            <AdminDataTable<ImageItem>
              tableScope="file-storage-images"
              data={rows}
              getRowId={(row) => row.relativePath}
              columns={columns}
              isLoading={loading}
              emptyLabel="Chưa có hình ảnh nào. Nhấn Tải lên để thêm."
              manualFiltering
              showIndexColumn
              {...adminTableRowSelectionProps(selectedRowIds, setSelectedRowIds)}
              bulkActions={bulkActions}
              showColumnFilters={false}
              showTableColumnPicker={false}
              pagination={{
                page,
                pageSize,
                total,
                isLoading: loading,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
                emptySummary: "Không có hình ảnh",
                itemLabel: "hình ảnh",
              }}
            />
          </TabsContent>

          <TabsContent value="files">
            <AdminDataTable<ImageItem>
              tableScope="file-storage-files"
              data={rows}
              getRowId={(row) => row.relativePath}
              columns={columns}
              isLoading={loading}
              emptyLabel="Chưa có tệp tin nào. Nhấn Tải lên để thêm."
              manualFiltering
              showIndexColumn
              {...adminTableRowSelectionProps(selectedRowIds, setSelectedRowIds)}
              bulkActions={bulkActions}
              showColumnFilters={false}
              showTableColumnPicker={false}
              pagination={{
                page,
                pageSize,
                total,
                isLoading: loading,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
                emptySummary: "Không có tệp tin",
                itemLabel: "tệp tin",
              }}
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
    </AdminPageGuard>
  );
}
