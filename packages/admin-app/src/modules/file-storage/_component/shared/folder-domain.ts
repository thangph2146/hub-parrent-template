import type { StorageRealm } from "./types"
import { resolveFolderPathAfterCreate } from "./utils"

/** Chuẩn hóa đường dẫn folder trên disk (slash, bỏ slash đầu/cuối). */
export function normalizeFolderPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")
}

/** Path home tùy chỉnh trong nav (scoped browse). */
export function normalizeHomeFolderPath(path?: string): string {
  return path ? normalizeFolderPath(path) : ""
}

/** Disk path → nav path (relative trong realm tab). */
export function diskPathToNavPath(
  realm: StorageRealm,
  diskPath: string
): string {
  return resolveFolderPathAfterCreate(normalizeFolderPath(diskPath), realm)
}

export function formatStorageFolderLabel(folder: {
  path: string
  name: string
  label?: string
}): string {
  const leaf = normalizeFolderPath(folder.path).split("/").pop()
  return folder.label?.trim() || folder.name?.trim() || leaf || folder.path
}

export function formatStorageFolderPathHint(
  diskPath: string,
  realm: StorageRealm
): string {
  const normalized = normalizeFolderPath(diskPath)
  const nav = diskPathToNavPath(realm, normalized)
  return nav || normalized
}

/** Breadcrumb scoped — chỉ hiện phần dưới root folder. */
export function scopeFolderBreadcrumb(
  breadcrumb: Array<{ id: string; label: string }>,
  rootFolderPath: string
): Array<{ id: string; label: string }> {
  const root = normalizeFolderPath(rootFolderPath)
  if (!root) return breadcrumb
  const idx = breadcrumb.findIndex((crumb) => crumb.id === root)
  if (idx >= 0) return breadcrumb.slice(idx + 1)
  return breadcrumb
}

/** Giữ folder path trong phạm vi root (scoped browse). */
export function clampFolderPath(
  folderPath: string,
  rootFolderPath: string
): string {
  const root = normalizeFolderPath(rootFolderPath)
  if (!root) return folderPath
  const normalized = normalizeFolderPath(folderPath)
  if (!normalized) return root
  if (normalized === root || normalized.startsWith(`${root}/`)) return normalized
  return root
}

export type FolderNavSearchState = {
  trimmedQuery: string
  isSearching: boolean
  searchActive: boolean
  showSearchPanel: boolean
  isDebouncing: boolean
}

/** Derived state cho ô tìm folder — tránh lặp boolean trong component. */
export function deriveFolderNavSearchState(
  folderQuery: string,
  debouncedFolderQuery: string,
  searchOpen: boolean
): FolderNavSearchState {
  const trimmedQuery = folderQuery.trim()
  const debouncedTrimmed = debouncedFolderQuery.trim()
  const isSearching = trimmedQuery.length > 0
  const searchActive = debouncedTrimmed.length > 0

  return {
    trimmedQuery,
    isSearching,
    searchActive,
    showSearchPanel: searchOpen && isSearching,
    isDebouncing: folderQuery !== debouncedFolderQuery,
  }
}
