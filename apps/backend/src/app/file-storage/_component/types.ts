import type { ImageItem, StorageRealm, StorageTab } from "@/lib/admin-uploads"

export type FileStorageRow = ImageItem

/** Tab động theo folder hệ thống (admincp, avatars, files, …). */
export type FileStorageTab = string

export type { StorageTab, StorageRealm }
