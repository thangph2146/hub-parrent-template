export {
  FileStorageScopedBrowse,
  type FileStorageScopedBrowseProps,
  FileStorageFolderNav,
  FileStorageFolderTree,
  FileStorageGlobalEmpty,
  FileStorageTabEmpty,
  StorageVideoPreview,
  FileStorageCreateFolderButton,
  FileStorageDeleteFolderButton,
  FileStoragePickerPanel,
  type FileStoragePickerPanelProps,
} from "./browse"

export {
  FileStorageUploadDialog,
  FileStorageMoveDialog,
  FileStorageReorganizeDialog,
  FileStorageImportConfirmDialogs,
  type FileStorageImportConfirmState,
} from "./dialogs"

export {
  FileStorageTable,
  FileStoragePickerTable,
  getFileStorageColumns,
  FileStorageRowActions,
} from "./_table"

export {
  useFileStorageActions,
  useFileStorageList,
  useFolderNavSearch,
  useStorageFolders,
} from "./_hooks"

export type {
  FileStorageRow,
  FileStorageTab,
  StorageRealm,
  StorageTab,
} from "./shared"

export {
  clampFolderPath,
  diskPathToNavPath,
  normalizeFolderPath,
  scopeFolderBreadcrumb,
  formatFileSize,
  isImageStorageRow,
  resolveFolderPathAfterCreate,
  resolveStorageAssetUrl,
  isPreviewableStorageRow,
  isVideoStorageRow,
  extensionsFromGroupIds,
  getRealmDefaultGroupIds,
  formatExtensionsSummary,
  getRealmDefaultExtensions,
} from "./shared"

export type { ProductImageUploadContext } from "@workspace/admin-app/lib/product-image-storage-stub"
export {
  default,
  default as FileStoragePage,
  FileStoragePageInner,
} from "./_page/file-storage-page"
