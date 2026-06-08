import JSZip from "jszip";
import { DEFAULT_API_URL } from "@workspace/api-client";
import type { FileStorageRow } from "./types";

const STORAGE_UPLOADS_PREFIX = "/api/uploads/";

function getApiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  return configured.replace(/\/api\/?$/, "");
}

type StorageAssetRef = Pick<FileStorageRow, "url" | "relativePath">;

/** URL tuyệt đối tới public uploads trên API (tránh request nhầm sang :3001). */
export function resolveStorageAssetUrl(row: StorageAssetRef): string {
  const raw = row.url?.trim();
  if (raw?.startsWith("http://") || raw?.startsWith("https://")) {
    return raw;
  }
  const apiOrigin = getApiOrigin();
  const relative = row.relativePath.replace(/\\/g, "/").replace(/^\//, "");
  if (raw?.startsWith(STORAGE_UPLOADS_PREFIX)) {
    return `${apiOrigin}${raw}`;
  }
  if (raw?.startsWith("api/uploads/")) {
    return `${apiOrigin}/${raw}`;
  }
  return `${apiOrigin}${STORAGE_UPLOADS_PREFIX}${relative}`;
}

/** Thumbnail nhỏ qua `/api/uploads/resized/*` — giảm băng thông trong bảng. */
export function storageThumbnailUrl(
  row: StorageAssetRef,
  width = 120,
): string {
  const base = resolveStorageAssetUrl(row);
  const marker = STORAGE_UPLOADS_PREFIX;
  const idx = base.indexOf(marker);
  if (idx === -1 || base.includes(`${marker}resized/`)) {
    return base;
  }
  const origin = base.slice(0, idx + marker.length);
  const path = base.slice(idx + marker.length);
  if (!path) return base;
  return `${origin}resized/${path}?w=${width}&q=75`;
}

async function fetchStorageBlob(row: FileStorageRow): Promise<Blob> {
  const response = await fetch(resolveStorageAssetUrl(row));
  if (!response.ok) {
    throw new Error(`Không tải được file (${response.status})`);
  }
  return response.blob();
}

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
  const blob = await fetchStorageBlob(row);
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

  const concurrency = 6;
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < rows.length) {
      const index = cursor;
      cursor += 1;
      const row = rows[index];
      if (!row) continue;
      try {
        const blob = await fetchStorageBlob(row);
        zip.file(storageZipEntryPath(row, usedPaths), blob);
        success += 1;
      } catch {
        fail += 1;
      }
      onProgress?.(index + 1, rows.length);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, rows.length) }, () => worker()),
  );

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

export function isVideoMime(mime: string): boolean {
  return mime.startsWith("video/");
}

/** Ảnh / video có thể xem trước trong UI (kiểu Google Drive). */
export function isPreviewableStorageRow(
  row: Pick<FileStorageRow, "mediaKind" | "mimeType">,
): boolean {
  if (row.mediaKind === "image" || row.mediaKind === "video") return true;
  return isImageMime(row.mimeType) || isVideoMime(row.mimeType);
}

export function isImageStorageRow(
  row: Pick<FileStorageRow, "mediaKind" | "mimeType">,
): boolean {
  return row.mediaKind === "image" || isImageMime(row.mimeType);
}

export function isVideoStorageRow(
  row: Pick<FileStorageRow, "mediaKind" | "mimeType">,
): boolean {
  return row.mediaKind === "video" || isVideoMime(row.mimeType);
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

export type StorageFolderRef = { path: string; name: string };

export type StorageFolderTreeNode = {
  path: string;
  name: string;
  children: StorageFolderTreeNode[];
};

function normalizeFolderDiskPath(
  folderPath: string,
  realm: StorageRealmRef,
): string {
  const normalized = folderPath.replace(/\\/g, "/").replace(/\/$/, "");
  const root = storageRealmRoot(realm);
  if (normalized === root || normalized.startsWith(`${root}/`)) {
    return normalized;
  }
  if (
    realm === "images" &&
    !normalized.startsWith("files/") &&
    !normalized.startsWith("videos/") &&
    !normalized.startsWith("audio/") &&
    normalized !== "files" &&
    normalized !== "videos" &&
    normalized !== "audio"
  ) {
    return `${root}/${normalized}`;
  }
  return normalized;
}

/** Cây thư mục đích theo realm — bỏ nút gốc images/files/videos, path node = disk path. */
export function buildRealmFolderTree(
  folders: StorageFolderRef[],
  realm: StorageRealmRef,
): StorageFolderTreeNode[] {
  const root = storageRealmRoot(realm);
  const diskPaths = [
    ...new Set(
      filterFoldersByRealm(folders, realm).map((folder) =>
        normalizeFolderDiskPath(folder.path, realm),
      ),
    ),
  ]
    .filter((diskPath) => diskPath !== root)
    .sort((a, b) => a.localeCompare(b));

  const roots: StorageFolderTreeNode[] = [];
  const nodeMap = new Map<string, StorageFolderTreeNode>();

  for (const diskPath of diskPaths) {
    const parts = diskPath.split("/").filter(Boolean);
    const relParts = parts[0] === root ? parts.slice(1) : parts;
    if (!relParts.length) continue;

    let siblings = roots;
    let accumulated = root;
    for (const part of relParts) {
      accumulated = `${accumulated}/${part}`;
      let node = nodeMap.get(accumulated);
      if (!node) {
        node = { path: accumulated, name: part, children: [] };
        nodeMap.set(accumulated, node);
        siblings.push(node);
      }
      siblings = node.children;
    }
  }

  return roots;
}

/** Xây cây thư mục từ danh sách path phẳng (images/admincp/…). */
export function buildStorageFolderTree(
  folders: StorageFolderRef[],
): StorageFolderTreeNode[] {
  const roots: StorageFolderTreeNode[] = [];
  const nodeMap = new Map<string, StorageFolderTreeNode>();

  const sorted = [...folders].sort((a, b) => a.path.localeCompare(b.path));
  for (const folder of sorted) {
    const parts = folder.path.replace(/\\/g, "/").split("/").filter(Boolean);
    let currentPath = "";
    let siblings = roots;

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let node = nodeMap.get(currentPath);
      if (!node) {
        node = { path: currentPath, name: part, children: [] };
        nodeMap.set(currentPath, node);
        siblings.push(node);
      }
      siblings = node.children;
    }
  }

  return roots;
}

/** Lọc cây — giữ nhánh có node khớp từ khóa hoặc con khớp. */
export function filterStorageFolderTree(
  nodes: StorageFolderTreeNode[],
  query: string,
): StorageFolderTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const visit = (node: StorageFolderTreeNode): StorageFolderTreeNode | null => {
    const selfMatch =
      node.path.toLowerCase().includes(q) ||
      node.name.toLowerCase().includes(q);
    const children = node.children
      .map(visit)
      .filter((child): child is StorageFolderTreeNode => child !== null);
    if (selfMatch || children.length > 0) {
      return { ...node, children };
    }
    return null;
  };

  return nodes
    .map(visit)
    .filter((node): node is StorageFolderTreeNode => node !== null);
}

/** Thu thập path các node có con — dùng auto-expand khi lọc. */
export function collectStorageFolderExpandablePaths(
  nodes: StorageFolderTreeNode[],
  out = new Set<string>(),
): Set<string> {
  for (const node of nodes) {
    if (node.children.length > 0) {
      out.add(node.path);
      collectStorageFolderExpandablePaths(node.children, out);
    }
  }
  return out;
}

/** Mở rộng các nhánh cha của path đã chọn. */
export function expandStorageFolderAncestors(
  folderPath: string,
  expanded: Set<string>,
): void {
  const parts = folderPath.replace(/\\/g, "/").split("/").filter(Boolean);
  let current = "";
  for (let i = 0; i < parts.length - 1; i += 1) {
    current = current ? `${current}/${parts[i]}` : parts[i];
    expanded.add(current);
  }
}

type StorageRealmRef = "images" | "files" | "videos" | "audio";

export const REALM_STORAGE_LABELS: Record<StorageRealmRef, string> = {
  images: "Hình ảnh",
  files: "Tệp tin",
  videos: "Video",
  audio: "Âm thanh",
};

export const REALM_STORAGE_ROOT_PATH: Record<StorageRealmRef, string> = {
  images: "images",
  files: "files",
  videos: "videos",
  audio: "audio",
};

export function buildRealmVirtualRoots(realm: StorageRealmRef): Array<{
  value: string;
  label: string;
}> {
  return [
    {
      value: REALM_STORAGE_ROOT_PATH[realm],
      label: `Gốc — ${REALM_STORAGE_LABELS[realm]}`,
    },
  ];
}

function storageRealmRoot(realm: StorageRealmRef): string {
  if (realm === "files") return "files";
  if (realm === "videos") return "videos";
  if (realm === "audio") return "audio";
  return "images";
}

/** Gợi ý thư mục mặc định theo realm + tab folder đang xem. */
export function resolveDefaultFolderPath(
  folders: StorageFolderRef[],
  activeRealm: StorageRealmRef,
  activeFolderTab: string,
): string {
  const root = storageRealmRoot(activeRealm);

  if (!folders.length) {
    if (!activeFolderTab) return root;
    return activeRealm === "images"
      ? activeFolderTab
      : `${root}/${activeFolderTab}`;
  }

  if (!activeFolderTab) {
    const underRoot = folders
      .filter((f) => f.path === root || f.path.startsWith(`${root}/`))
      .sort((a, b) => a.path.length - b.path.length);
    return underRoot[0]?.path ?? root;
  }

  const candidates =
    activeRealm === "files"
      ? [`files/${activeFolderTab}`, "files", activeFolderTab]
      : activeRealm === "videos"
        ? [`videos/${activeFolderTab}`, "videos", activeFolderTab]
        : activeRealm === "audio"
          ? [`audio/${activeFolderTab}`, "audio", activeFolderTab]
          : [`images/${activeFolderTab}`, activeFolderTab, `images/${activeFolderTab}/`];

  for (const candidate of candidates) {
    const normalized = candidate.replace(/\/$/, "");
    const exact = folders.find((f) => f.path === normalized);
    if (exact) return exact.path;
  }

  const prefix =
    activeRealm === "files"
      ? "files"
      : activeRealm === "videos"
        ? "videos"
        : activeRealm === "audio"
          ? "audio"
          : `images/${activeFolderTab}`;
  const underTab = folders
    .filter((f) => f.path === prefix || f.path.startsWith(`${prefix}/`))
    .sort((a, b) => a.path.length - b.path.length);
  if (underTab.length > 0) return underTab[0].path;

  return activeRealm === "images" ? activeFolderTab : `${root}/${activeFolderTab}`;
}

export function normalizeParentFolderDiskPath(
  realm: StorageRealmRef,
  folderPath: string,
): string {
  const fp = folderPath.trim().replace(/\\/g, "/").replace(/\/$/, "");
  if (!fp) return "";
  if (
    fp.startsWith("images/") ||
    fp.startsWith("files/") ||
    fp.startsWith("videos/") ||
    fp.startsWith("audio/")
  ) {
    return fp;
  }
  if (realm === "images") {
    return fp === "images" ? "" : `images/${fp}`;
  }
  if (realm === "files") return fp === "files" ? "" : `files/${fp}`;
  if (realm === "videos") {
    return fp === "videos" ? "" : `videos/${fp}`;
  }
  return fp === "audio" ? "" : `audio/${fp}`;
}

/** Parent path + resourceType khi tạo folder tại path điều hướng hiện tại. */
export function resolveCreateFolderParent(
  realm: StorageRealmRef,
  parentFolderPath = "",
): { parentPath?: string; resourceType: "images" | "files" | "videos" | "audio" } {
  const parentDisk = normalizeParentFolderDiskPath(realm, parentFolderPath);
  if (!parentDisk) {
    if (realm === "images") {
      return { parentPath: "images", resourceType: "images" };
    }
    return { parentPath: undefined, resourceType: realm };
  }
  return {
    parentPath: parentDisk,
    resourceType: inferFolderResourceType(parentDisk),
  };
}

export function resolveStorageFolderDiskPath(
  realm: StorageRealmRef,
  folderPath: string,
): string {
  const disk = normalizeParentFolderDiskPath(realm, folderPath);
  return disk || "";
}

export function filterFoldersByRealm(
  folders: Array<{ path: string; name: string }>,
  realm: StorageRealmRef,
): Array<{ path: string; name: string }> {
  const root = storageRealmRoot(realm);
  return folders.filter((folder) => {
    const path = folder.path.replace(/\\/g, "/");
    if (realm === "images") {
      return (
        path.startsWith("images/") ||
        path === "images" ||
        (!path.startsWith("files/") &&
          !path.startsWith("videos/") &&
          !path.startsWith("audio/") &&
          path !== "files" &&
          path !== "videos" &&
          path !== "audio")
      );
    }
    if (realm === "files") {
      return path === "files" || path.startsWith("files/");
    }
    if (realm === "videos") {
      return path === "videos" || path.startsWith("videos/");
    }
    return path === "audio" || path.startsWith("audio/");
  });
}

/** Gợi ý chuyển tab sau khi tạo folder mới. */
/** Phạm vi cấu trúc lại folder theo folder đang mở. */
export function resolveReorganizeScopePath(
  realm: StorageRealmRef,
  activeFolderPath: string,
): string {
  const disk = normalizeParentFolderDiskPath(realm, activeFolderPath);
  return disk || storageRealmRoot(realm);
}

export function resolveFolderPathAfterCreate(
  folderPath: string,
  realm: StorageRealmRef,
): string {
  const parts = folderPath.replace(/\\/g, "/").split("/").filter(Boolean);
  if (!parts.length) return "";

  if (realm === "images") {
    if (parts[0] === "images") return parts.slice(1).join("/");
    return parts.join("/");
  }
  if (realm === "files") {
    if (parts[0] === "files") return parts.slice(1).join("/") || "files";
    return parts.join("/");
  }
  if (parts[0] === "videos") {
    return parts.slice(1).join("/") || "videos";
  }
  if (parts[0] === "audio") {
    return parts.slice(1).join("/") || "audio";
  }
  return parts.join("/");
}

export function inferFolderResourceType(
  folderPath: string,
): "images" | "files" | "videos" | "audio" {
  const normalized = folderPath.replace(/\\/g, "/").replace(/\/$/, "");
  if (normalized === "files" || normalized.startsWith("files/")) {
    return "files";
  }
  if (normalized === "videos" || normalized.startsWith("videos/")) {
    return "videos";
  }
  if (normalized === "audio" || normalized.startsWith("audio/")) {
    return "audio";
  }
  return "images";
}

export function formatStorageFolderOption(folder: StorageFolderRef): string {
  return folder.path;
}
