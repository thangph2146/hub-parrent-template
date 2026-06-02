import { createAdminImageUploader } from "@ui/components/admin"
import { readAdminSession } from "@/lib/auth-session"

export function adminUploadAuthHeaders(): Record<string, string> {
  const uid = readAdminSession()?.id
  return uid ? { "X-User-Id": String(uid) } : {}
}

/** Upload ảnh admin — header phiên từ backend. */
export const uploadAdminImage = createAdminImageUploader({
  getAuthHeaders: adminUploadAuthHeaders,
})

export type { AdminUploadOptions } from "@ui/components/admin"
