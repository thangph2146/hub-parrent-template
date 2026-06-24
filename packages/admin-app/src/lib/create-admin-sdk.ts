import {
  createStoreSyncSdk,
  type ApiClientOptions,
} from "@workspace/api-client"
import {
  getAdminDevAuthLogContext,
  getAdminUserId,
  readAdminSession,
} from "./auth-session"
import { getApiBaseUrl, getDirectApiBaseUrl } from "./api-base-url"
import type { AdminSdk } from "./api"

export type CreateAdminSdkOptions = {
  devLogTag: string
  devLogging?: boolean
}

function adminAuthOptions(): Pick<ApiClientOptions, "getUserId" | "getUserEmail"> {
  return {
    getUserId: () => {
      if (typeof window === "undefined") return null
      return getAdminUserId()
    },
    getUserEmail: () => {
      if (typeof window === "undefined") return null
      return readAdminSession()?.email?.trim() || null
    },
  }
}

/** SDK admin — app chỉ truyền `devLogTag`. */
export function createAdminSdk(options: CreateAdminSdkOptions): AdminSdk {
  return createStoreSyncSdk({
    baseUrl: getApiBaseUrl(),
    ...adminAuthOptions(),
    devLogging:
      options.devLogging ??
      (typeof process !== "undefined" &&
        process.env.NODE_ENV === "development"),
    devLogTag: options.devLogTag,
    getDevAuthContext: () => getAdminDevAuthLogContext(),
  })
}

let cachedImportApi: AdminSdk | null = null

/** Import gọi thẳng microservice @api khi UI dùng Next proxy (giới hạn body 10MB). */
export function resolveImportApi(api: AdminSdk): AdminSdk {
  const direct = getDirectApiBaseUrl()
  if (direct === getApiBaseUrl()) return api
  cachedImportApi ??= createStoreSyncSdk({
    baseUrl: direct,
    ...adminAuthOptions(),
  })
  return cachedImportApi
}
