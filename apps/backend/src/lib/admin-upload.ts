import type { AdminUploadOptions } from "@ui/components/admin"
import { api } from "./api"

/** Upload ảnh admin — phiên qua SDK (`X-User-Id` từ `lib/api.ts`). */
export async function uploadAdminImage(
  file: File,
  options: AdminUploadOptions,
): Promise<string> {
  const { url } = await api.uploads.uploadFile(file, {
    folderPath: options.folderPath,
    isExistingFolder: options.isExistingFolder,
  })
  const trimmed = url?.trim()
  if (!trimmed) throw new Error("Không nhận được URL ảnh")
  return trimmed
}

export type { AdminUploadOptions } from "@ui/components/admin"
