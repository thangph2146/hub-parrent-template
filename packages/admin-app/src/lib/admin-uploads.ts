import { api } from "@workspace/admin-app/lib/api"
import type {
  ImportArchiveResult,
  ListImagesData,
  ImageItem,
  UploadsBulkDeleteResult,
  StorageTab,
  StorageMediaKind,
  StorageRealm,
  FolderItem,
  CreateStorageFolderResult,
  ReorganizeDateFoldersResult,
  BulkMoveFilesResult,
} from "@workspace/api-client"
import { fetchAllAdminList } from "./fetch-all-admin-list"

export type {
  ListImagesData,
  ImageItem,
  ImportArchiveResult,
  UploadsBulkDeleteResult,
  StorageTab,
  StorageMediaKind,
  StorageRealm,
  FolderItem,
  CreateStorageFolderResult,
  ReorganizeDateFoldersResult,
  BulkMoveFilesResult,
}

/** Tab = folder hệ thống (admincp, avatars, files, …). */
export type FileStorageTabId = string

export async function fetchStorageFolders(): Promise<FolderItem[]> {
  return api.uploads.listFolders()
}

export async function reorganizeDateStorageFolders(options?: {
  scopePath?: string
  dryRun?: boolean
}): Promise<ReorganizeDateFoldersResult> {
  return api.uploads.reorganizeDateFolders(options)
}

export async function createStorageFolder(options: {
  folderName: string
  parentPath?: string
  resourceType?: "images" | "files" | "videos" | "audio"
  allowedExtensions?: string[]
}): Promise<CreateStorageFolderResult> {
  return api.uploads.createFolder(options)
}

export async function fetchImages(
  page: number,
  limit: number,
  options?: {
    realm?: StorageRealm
    folderPath?: FileStorageTabId
    tab?: FileStorageTabId
    includeDescendants?: boolean
    uploadOwnerId?: string
  }
): Promise<ListImagesData> {
  return api.uploads.list(page, limit, {
    realm: options?.realm,
    folderPath: options?.folderPath ?? options?.tab,
    includeDescendants: options?.includeDescendants,
    uploadOwnerId: options?.uploadOwnerId,
  })
}

export async function deleteStorageFolder(path: string): Promise<void> {
  return api.uploads.deleteFolder(path)
}

export async function bulkMoveStorageFiles(
  paths: string[],
  destinationFolder: string
): Promise<BulkMoveFilesResult> {
  return api.uploads.bulkMoveFiles(paths, destinationFolder)
}

export async function deleteUploadedFile(relativePath: string): Promise<void> {
  await api.uploads.remove(relativePath)
}

/** Xóa hàng loạt qua một request API (giống batch delete của Google Drive). */
export async function deleteUploadedFilesBulk(
  paths: string[]
): Promise<UploadsBulkDeleteResult> {
  return api.uploads.bulkRemove(paths)
}

/** Lấy toàn bộ file trong tab (images / files), không chỉ trang hiện tại. */
export async function fetchAllFileStorageRows(
  realm: StorageRealm,
  tab?: FileStorageTabId,
  options?: { includeDescendants?: boolean; uploadOwnerId?: string }
): Promise<ImageItem[]> {
  return fetchAllAdminList(async ({ page, limit }) => {
    const data = await fetchImages(page, limit, {
      realm,
      folderPath: tab,
      includeDescendants: options?.includeDescendants,
      uploadOwnerId: options?.uploadOwnerId,
    })
    return { items: data.data, total: data.pagination.total }
  })
}

/**
 * Lấy toàn bộ file trong kho lưu trữ (images/, files/, thư mục legacy).
 * Giữ nguyên relativePath như trên disk — dùng khi nén ZIP theo cấu trúc thư mục.
 */
export async function fetchAllStoredFileStorageRows(): Promise<ImageItem[]> {
  return fetchAllAdminList(async ({ page, limit }) => {
    const data = await fetchImages(page, limit, {})
    return { items: data.data, total: data.pagination.total }
  })
}

/** Xuất ZIP toàn bộ kho lưu trữ (server quét disk — lấy hết file). */
export async function exportFileStorageArchive(): Promise<{
  blob: Blob
  meta: { fileCount: number; skipped: number }
}> {
  return api.uploads.exportArchive()
}

/** Khôi phục kho lưu trữ từ file ZIP backup. */
export async function importFileStorageArchive(
  file: File,
  options?: { overwrite?: boolean }
): Promise<ImportArchiveResult> {
  return api.uploads.importArchive(file, options)
}
