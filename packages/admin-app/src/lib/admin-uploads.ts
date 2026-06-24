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
  StoreSyncSdk,
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

export async function fetchStorageFolders(
  api: StoreSyncSdk
): Promise<FolderItem[]> {
  return api.uploads.listFolders()
}

export async function reorganizeDateStorageFolders(
  api: StoreSyncSdk,
  options?: {
    scopePath?: string
    dryRun?: boolean
  }
): Promise<ReorganizeDateFoldersResult> {
  return api.uploads.reorganizeDateFolders(options)
}

export async function createStorageFolder(
  api: StoreSyncSdk,
  options: {
    folderName: string
    parentPath?: string
    resourceType?: "images" | "files" | "videos" | "audio"
    allowedExtensions?: string[]
  }
): Promise<CreateStorageFolderResult> {
  return api.uploads.createFolder(options)
}

export async function fetchImages(
  api: StoreSyncSdk,
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

export async function deleteStorageFolder(
  api: StoreSyncSdk,
  path: string
): Promise<void> {
  return api.uploads.deleteFolder(path)
}

export async function bulkMoveStorageFiles(
  api: StoreSyncSdk,
  paths: string[],
  destinationFolder: string
): Promise<BulkMoveFilesResult> {
  return api.uploads.bulkMoveFiles(paths, destinationFolder)
}

export async function deleteUploadedFile(
  api: StoreSyncSdk,
  relativePath: string
): Promise<void> {
  await api.uploads.remove(relativePath)
}

export async function deleteUploadedFilesBulk(
  api: StoreSyncSdk,
  paths: string[]
): Promise<UploadsBulkDeleteResult> {
  return api.uploads.bulkRemove(paths)
}

export async function fetchAllFileStorageRows(
  api: StoreSyncSdk,
  realm: StorageRealm,
  tab?: FileStorageTabId,
  options?: { includeDescendants?: boolean; uploadOwnerId?: string }
): Promise<ImageItem[]> {
  return fetchAllAdminList(async ({ page, limit }) => {
    const data = await fetchImages(api, page, limit, {
      realm,
      folderPath: tab,
      includeDescendants: options?.includeDescendants,
      uploadOwnerId: options?.uploadOwnerId,
    })
    return { items: data.data, total: data.pagination.total }
  })
}

export async function fetchAllStoredFileStorageRows(
  api: StoreSyncSdk
): Promise<ImageItem[]> {
  return fetchAllAdminList(async ({ page, limit }) => {
    const data = await fetchImages(api, page, limit, {})
    return { items: data.data, total: data.pagination.total }
  })
}

export async function exportFileStorageArchive(api: StoreSyncSdk): Promise<{
  blob: Blob
  meta: { fileCount: number; skipped: number }
}> {
  return api.uploads.exportArchive()
}

export async function importFileStorageArchive(
  api: StoreSyncSdk,
  file: File,
  options?: { overwrite?: boolean }
): Promise<ImportArchiveResult> {
  return api.uploads.importArchive(file, options)
}
