import { DEFAULT_API_URL } from "@workspace/api-client"
import type { AdminStorageFileRow } from "./types"

const STORAGE_UPLOADS_PREFIX = "/api/uploads/"

/** Chuyển URL serve hoặc path tương đối thành relativePath kho (`images/...`). */
export function extractStorageRelativePath(urlOrPath: string): string | null {
  let raw = urlOrPath.trim().replace(/\\/g, "/")
  if (!raw) return null

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    const markerIdx = raw.indexOf(STORAGE_UPLOADS_PREFIX)
    if (markerIdx === -1) return null
    raw = raw.slice(markerIdx + STORAGE_UPLOADS_PREFIX.length)
  } else if (raw.startsWith(STORAGE_UPLOADS_PREFIX)) {
    raw = raw.slice(STORAGE_UPLOADS_PREFIX.length)
  } else if (raw.startsWith("api/uploads/")) {
    raw = raw.slice("api/uploads/".length)
  } else {
    raw = raw.replace(/^\/+/, "")
  }

  if (raw.startsWith("resized/")) {
    raw = raw.slice("resized/".length)
  }

  const queryIdx = raw.indexOf("?")
  if (queryIdx >= 0) raw = raw.slice(0, queryIdx)

  raw = raw.replace(/^\/+/, "").replace(/\/+$/, "")
  return raw || null
}

function getApiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/api\/?$/,
    ""
  )
}

type StorageAssetRef = Pick<AdminStorageFileRow, "url" | "relativePath">

export function resolveStorageAssetUrl(row: StorageAssetRef): string {
  const raw = row.url?.trim()
  if (raw?.startsWith("http://") || raw?.startsWith("https://")) {
    return raw
  }
  const apiOrigin = getApiOrigin()
  const relative = row.relativePath.replace(/\\/g, "/").replace(/^\//, "")
  if (raw?.startsWith(STORAGE_UPLOADS_PREFIX)) {
    return `${apiOrigin}${raw}`
  }
  if (raw?.startsWith("api/uploads/")) {
    return `${apiOrigin}/${raw}`
  }
  return `${apiOrigin}${STORAGE_UPLOADS_PREFIX}${relative}`
}

export function storageThumbnailUrl(row: StorageAssetRef, width = 120): string {
  const base = resolveStorageAssetUrl(row)
  const marker = STORAGE_UPLOADS_PREFIX
  const idx = base.indexOf(marker)
  if (idx === -1 || base.includes(`${marker}resized/`)) {
    return base
  }
  const origin = base.slice(0, idx + marker.length)
  const path = base.slice(idx + marker.length)
  if (!path) return base
  return `${origin}resized/${path}?w=${width}&q=75`
}

function isImageMime(mime?: string | null): boolean {
  return Boolean(mime?.toLowerCase().startsWith("image/"))
}

export function isImageStorageRow(
  row: Pick<AdminStorageFileRow, "mediaKind" | "mimeType">
): boolean {
  return row.mediaKind === "image" || isImageMime(row.mimeType)
}

/** Rút gọn lỗi xóa file từ API cho người dùng admin. */
export function formatStorageDeleteError(message: string): string {
  if (message.includes("EBUSY")) {
    return "File đang được hệ thống dùng (ảnh đang hiển thị). Đợi vài giây rồi thử lại."
  }
  if (message.includes("EPERM") || message.includes("EACCES")) {
    return "File đang bị khóa hoặc không đủ quyền xóa."
  }
  if (message.includes("ENOENT")) {
    return "File không còn trên disk."
  }
  return message.length > 120 ? `${message.slice(0, 117)}…` : message
}

export function formatStorageFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
