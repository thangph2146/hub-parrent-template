import type {
  ImageItem,
  ListImagesData,
  StorageRealm,
  UploadsBulkDeleteResult,
} from "@workspace/api-client"

export type AdminStorageFileRow = ImageItem

export type AdminStoragePickerListParams = {
  realm: StorageRealm
  folderPath?: string
  page: number
  limit: number
  includeDescendants?: boolean
}

export type AdminStoragePickerAdapters = {
  listFiles: (params: AdminStoragePickerListParams) => Promise<ListImagesData>
  deleteFile: (relativePath: string) => Promise<void>
  bulkDeleteFiles: (relativePaths: string[]) => Promise<UploadsBulkDeleteResult>
}

/** Khóa duyệt trong một folder (vd. ảnh sản phẩm đang sửa). */
export type AdminStoragePickerFolderScope = {
  folderPath: string
  folderLabel: string
  parentLabel?: string
  realm?: StorageRealm
  /** Tạo folder nếu chưa có — trả path dùng cho list/upload. */
  onBootstrap?: () => Promise<{ folderPath: string }>
}

export type AdminStoragePickerUploadConfig = {
  uploadFiles: (files: File[]) => Promise<string[]>
  accept?: string
  label?: string
  disabled?: boolean
}
