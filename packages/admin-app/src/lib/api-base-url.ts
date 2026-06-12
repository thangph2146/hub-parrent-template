import { api } from "@workspace/admin-app/lib/api"
import { DEFAULT_API_URL } from "@workspace/api-client"

function normalizeBasePath(raw: string | undefined): string {
  const v = (raw ?? "").trim()
  if (!v) return ""
  const withSlash = v.startsWith("/") ? v : `/${v}`
  return withSlash.replace(/\/+$/, "")
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "")
}

function directConfiguredUrl(): string {
  return stripTrailingSlash(
    process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      DEFAULT_API_URL,
  )
}

function browserDirectUrl(): string {
  const configured = directConfiguredUrl()
  if (typeof window === "undefined") return configured

  try {
    const url = new URL(configured)
    const pageHost = window.location.hostname
    const apiHostIsLoopback =
      url.hostname === "localhost" || url.hostname === "127.0.0.1"
    const pageHostIsLoopback =
      pageHost === "localhost" || pageHost === "127.0.0.1"

    if (apiHostIsLoopback && !pageHostIsLoopback) {
      url.hostname = pageHost
      return stripTrailingSlash(url.toString())
    }
  } catch {
    return configured
  }

  return configured
}

function browserProxyUrl(): string {
  const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BACKEND_BASE_PATH)
  const path = `${basePath}/api`.replace(/\/{2,}/g, "/")
  const relative = path.startsWith("/") ? path : `/${path}`
  // api-client dùng `new URL()` — cần origin tuyệt đối, không chỉ `/api`.
  return `${window.location.origin}${relative}`
}

/** URL gọi HTTP tới @api — browser dùng proxy same-origin khi bật. */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (process.env.NEXT_PUBLIC_API_PROXY === "true") {
      return browserProxyUrl()
    }
    return browserDirectUrl()
  }
  return directConfiguredUrl()
}

/** Origin socket.io — luôn trỏ thẳng microservice @api. */
export function getApiSocketBaseUrl(): string {
  return directConfiguredUrl()
}
