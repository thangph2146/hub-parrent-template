import type { AdminStoragePickerAdapters } from "@ui/components/admin/storage"
import { extractStorageRelativePath } from "@ui/components/admin/storage"
import { api } from "./api"

function normalizeStoragePaths(paths: string[]): string[] {
  return [
    ...new Set(
      paths
        .map((p) => extractStorageRelativePath(p) ?? p.trim())
        .filter(Boolean)
    ),
  ]
}

/** Adapter kho lưu trữ cho `AdminStorageImagePickerDialog` — HTTP qua api-client. */
export function createAdminStoragePickerAdapters(): AdminStoragePickerAdapters {
  return {
    listFiles: (params) =>
      api.uploads.list(params.page, params.limit, {
        realm: params.realm,
        folderPath: params.folderPath,
        includeDescendants: params.includeDescendants,
      }),
    deleteFile: (relativePath) => {
      const path =
        extractStorageRelativePath(relativePath) ?? relativePath.trim()
      return api.uploads.remove(path)
    },
    bulkDeleteFiles: (paths) =>
      api.uploads.bulkRemove(normalizeStoragePaths(paths)),
  }
}
