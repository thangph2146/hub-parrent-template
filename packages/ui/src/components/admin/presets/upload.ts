import { ApiClient, DEFAULT_API_URL, UploadsApi } from "@workspace/api-client"

export type AdminUploadOptions = {
  folderPath: string
  isExistingFolder?: boolean
  /** ID tài khoản chủ ảnh (vd. ảnh đại diện — profile cá nhân hoặc nhân sự đang sửa). */
  ownerUserId?: string | number
}

export type AdminImageUploaderConfig = {
  /** Base URL API (có prefix `/api`), mặc định từ env hoặc DEFAULT_API_URL. */
  getApiBase?: () => string
  getAuthHeaders?: () => Record<string, string>
}

function defaultApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")
}

/**
 * Factory upload ảnh admin — app truyền header phiên (vd. X-User-Id).
 * HTTP qua `@workspace/api-client` (`UploadsApi`), không `fetch` trực tiếp.
 */
export function createAdminImageUploader(
  config: AdminImageUploaderConfig = {}
) {
  const getApiBase = config.getApiBase ?? defaultApiBase
  const getAuthHeaders = config.getAuthHeaders ?? (() => ({}))

  return async function uploadAdminImage(
    file: File,
    options: AdminUploadOptions
  ): Promise<string> {
    const authHeaders: Record<string, string> = getAuthHeaders()
    const userId = authHeaders["X-User-Id"]
    const restHeaders = { ...authHeaders }
    delete restHeaders["X-User-Id"]

    const http = new ApiClient({
      baseUrl: getApiBase(),
      headers: restHeaders,
      getUserId: () => userId ?? null,
    })
    const uploads = new UploadsApi(http)
    const { url } = await uploads.uploadFile(file, {
      folderPath: options.folderPath,
      isExistingFolder: options.isExistingFolder,
      ownerUserId:
        options.ownerUserId == null ? undefined : String(options.ownerUserId),
    })
    const trimmed = url?.trim()
    if (!trimmed) throw new Error("Không nhận được URL ảnh")
    return trimmed
  }
}
