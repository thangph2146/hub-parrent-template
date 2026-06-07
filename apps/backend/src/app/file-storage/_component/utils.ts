import JSZip from "jszip";
import type { FileStorageRow } from "./types";

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Tải file từ URL public uploads về máy (giữ tên gốc). */
export async function downloadStorageFile(row: FileStorageRow): Promise<void> {
  const response = await fetch(row.url);
  if (!response.ok) {
    throw new Error(`Không tải được file (${response.status})`);
  }
  const blob = await response.blob();
  const filename =
    row.originalName?.trim() || row.fileName?.trim() || "download";
  triggerBrowserDownload(blob, filename);
}

/** Đường dẫn trong ZIP = relativePath trên kho (vd. images/2024/01/a.webp). */
export function storageZipEntryPath(
  row: FileStorageRow,
  used: Set<string>,
): string {
  const relative =
    row.relativePath.replace(/\\/g, "/").trim() ||
    row.originalName?.trim() ||
    row.fileName?.trim() ||
    "file";
  return uniqueZipEntryPath(relative, used);
}

function uniqueZipEntryPath(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : "";
  let index = 2;
  let candidate = `${stem}-${index}${ext}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${stem}-${index}${ext}`;
  }
  used.add(candidate);
  return candidate;
}

/** Nén và tải về danh sách file (một file .zip, giữ cấu trúc thư mục kho). */
export async function downloadStorageFilesAsZip(
  rows: FileStorageRow[],
  zipFilename: string,
  onProgress?: (done: number, total: number) => void,
): Promise<{ success: number; fail: number }> {
  if (!rows.length) {
    throw new Error("Không có file để tải về");
  }

  const zip = new JSZip();
  const usedPaths = new Set<string>();
  let success = 0;
  let fail = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    try {
      const response = await fetch(row.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      zip.file(storageZipEntryPath(row, usedPaths), blob);
      success += 1;
    } catch {
      fail += 1;
    }
    onProgress?.(index + 1, rows.length);
  }

  if (success === 0) {
    throw new Error("Không tải được file nào");
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerBrowserDownload(zipBlob, zipFilename);
  return { success, fail };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function getShortMimeType(mime: string): string {
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PPTX",
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
  const tail = mime.split("/").pop();
  return map[mime] ?? (tail ? tail.toUpperCase() : mime.toUpperCase());
}
