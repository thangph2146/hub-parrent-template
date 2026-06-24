import type { AdminUploadOptions } from "@ui/components/admin"
import type { StoreSyncSdk } from "@workspace/api-client"

/** Upload ảnh admin — SDK inject từ `useAdminApi()`. */
export async function uploadAdminImage(
  api: StoreSyncSdk,
  file: File,
  options: AdminUploadOptions
): Promise<string> {
  const { url } = await api.uploads.uploadFile(file, {
    folderPath: options.folderPath,
    isExistingFolder: options.isExistingFolder,
    ownerUserId: options.ownerUserId,
  })
  const trimmed = url?.trim()
  if (!trimmed) throw new Error("Không nhận được URL ảnh")
  return trimmed
}

export type { AdminUploadOptions } from "@ui/components/admin"
