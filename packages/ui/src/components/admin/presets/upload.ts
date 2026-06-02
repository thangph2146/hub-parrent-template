import { DEFAULT_API_URL } from "@workspace/api-client"

export type AdminUploadOptions = {
  folderPath: string
  isExistingFolder?: boolean
}

export type AdminImageUploaderConfig = {
  /** Base URL API (không có slash cuối), mặc định từ env hoặc DEFAULT_API_URL. */
  getApiBase?: () => string
  getAuthHeaders?: () => Record<string, string>
}

function defaultApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")
}

/**
 * Factory upload ảnh admin — app truyền header phiên (vd. X-User-Id).
 */
export function createAdminImageUploader(config: AdminImageUploaderConfig = {}) {
  const getApiBase = config.getApiBase ?? defaultApiBase
  const getAuthHeaders = config.getAuthHeaders ?? (() => ({}))

  return async function uploadAdminImage(
    file: File,
    options: AdminUploadOptions,
  ): Promise<string> {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folderPath", options.folderPath)
    if (options.isExistingFolder) {
      fd.append("isExistingFolder", "true")
    }

    const res = await fetch(`${getApiBase()}/admin/uploads`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: fd,
    })

    const json = (await res.json().catch(() => null)) as {
      success?: boolean
      message?: string
      error?: string | null
      data?: { url?: string }
    } | null

    if (!res.ok || json?.success === false) {
      throw new Error(
        json?.message || json?.error || `Upload thất bại (${res.status})`,
      )
    }

    const url = json?.data?.url?.trim()
    if (!url) throw new Error("Không nhận được URL ảnh")
    return url
  }
}
