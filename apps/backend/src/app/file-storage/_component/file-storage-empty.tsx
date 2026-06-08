"use client";

import { Button } from "@ui/components/button";
import { AdminEmptyState } from "@ui/components/admin";
import {
  ArchiveRestore,
  CloudUpload,
  FileImage,
  FolderOpen,
  Loader2,
  Upload,
} from "lucide-react";

type FileStorageGlobalEmptyProps = {
  canUpload: boolean;
  uploading: boolean;
  importing: boolean;
  onUpload: () => void;
  onImport: () => void;
};

export function FileStorageGlobalEmpty({
  canUpload,
  uploading,
  importing,
  onUpload,
  onImport,
}: FileStorageGlobalEmptyProps) {
  return (
    <AdminEmptyState
      icon={<FolderOpen className="text-primary" />}
      title="Kho lưu trữ đang trống"
      description="Chưa có ảnh, video hay tài liệu nào. Tải lên từng file hoặc khôi phục toàn bộ kho từ file ZIP backup."
      hints={[
        "Tải lên: chọn ảnh, video, PDF hoặc tài liệu — hệ thống tự phân loại theo folder.",
        "Khôi phục kho: chọn file ZIP đã xuất trước đó, chọn Ghi đè để import đầy đủ.",
        "Sau khi có file, chọn dạng lưu trữ (Hình ảnh / Tệp tin / Video) rồi duyệt theo folder hệ thống.",
      ]}
      actions={
        canUpload ? (
          <>
            <Button
              type="button"
              onClick={onUpload}
              disabled={uploading || importing}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading ? "Đang tải lên…" : "Tải lên file"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onImport}
              disabled={uploading || importing}
            >
              {importing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArchiveRestore className="size-4" />
              )}
              {importing ? "Đang khôi phục…" : "Khôi phục từ ZIP"}
            </Button>
          </>
        ) : undefined
      }
    />
  );
}

type FileStorageTabEmptyProps = {
  tabLabel: string;
  canUpload: boolean;
  uploading: boolean;
  onUpload?: () => void;
};

export function FileStorageTabEmpty({
  tabLabel,
  canUpload,
  uploading,
  onUpload,
}: FileStorageTabEmptyProps) {
  return (
    <AdminEmptyState
      size="compact"
      icon={<FileImage className="text-primary" />}
      title={`Chưa có file trong «${tabLabel}»`}
      description="Tab này tương ứng với một folder hệ thống. Tải file lên hoặc khôi phục kho từ ZIP để thấy nội dung tại đây."
      hints={[
        `File thuộc folder «${tabLabel}» sẽ xuất hiện trong tab này.`,
        "Ảnh và video có thể xem trực tiếp; tài liệu tải về hoặc mở link.",
      ]}
      actions={
        canUpload && onUpload ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUpload}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CloudUpload className="size-4" />
            )}
            {uploading ? "Đang tải…" : "Tải lên vào kho"}
          </Button>
        ) : undefined
      }
    />
  );
}
