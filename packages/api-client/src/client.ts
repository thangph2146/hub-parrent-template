/**
 * Tiny, dependency-free HTTP client used by every consumer of the @api
 * service. Wraps `fetch` so we can centralise auth headers, timeouts, error
 * shaping, and JSON parsing once and re-use it everywhere.
 */

import {
  buildDevLogResponseJson,
  formatDevApiStateHint,
  formatDevRequestBody,
  formatDevResponsePayload,
  printDevApiCall,
  printDevApiNetworkError,
  isAbortLikeError,
} from "@workspace/logger"
import { recordAdminApiCall, setAdminApiBaseUrl } from "./admin-api-call-trace"

function readNodeEnv(): string | undefined {
  // Node / SSR: process.env có sẵn. Browser: nhiều bundler (Next, Vite) vẫn thay
  // `process.env.NODE_ENV` bằng literal; globalThis.process thường không tồn tại.
  if (typeof process !== "undefined" && process.env?.NODE_ENV) {
    return process.env.NODE_ENV
  }
  const proc = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process
  return proc?.env?.NODE_ENV
}

function defaultDevLogging(options: ApiClientOptions): boolean {
  if (options.devLogging === false) return false
  if (options.devLogging === true) return true
  return readNodeEnv() === "development"
}

export interface ApiClientOptions {
  /** Base URL of the API, including the global prefix (e.g. http://localhost:3002/api). */
  baseUrl: string
  /** Static headers attached to every request. */
  headers?: Record<string, string>
  /** Lazily-resolved auth token (called per request). */
  getAuthToken?: () =>
    | string
    | null
    | undefined
    | Promise<string | null | undefined>
  /** User id hiện tại — gửi `X-User-Id` (RBAC trên API). */
  getUserId?: () =>
    | string
    | number
    | null
    | undefined
    | Promise<string | number | null | undefined>
  /** Default timeout in milliseconds. Defaults to 15s. */
  timeoutMs?: number
  /** Custom fetch implementation (e.g. for SSR / Node 18 stubs). */
  fetch?: typeof globalThis.fetch
  /**
   * Khi true (mặc định nếu `NODE_ENV === "development"`), ghi ra console
   * method, path, status và thời gian — tiện theo dõi app gọi API.
   */
  devLogging?: boolean
  /** Tiền tố log (vd: `HUB_ADMIN`) để phân biệt app trong monorepo. */
  devLogTag?: string
  /**
   * Chuỗi hoặc object mô tả user/role gửi kèm mỗi dòng log dev (không dùng cho secrets).
   */
  getDevAuthContext?: () =>
    | string
    | Record<string, unknown>
    | null
    | undefined
    | Promise<string | Record<string, unknown> | null | undefined>
}

/** Tùy chọn cache Next.js `fetch` (ISR / RSC). */
export type NextFetchRequestOptions = {
  revalidate?: number | false
  tags?: string[]
}

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>
  headers?: Record<string, string>
  signal?: AbortSignal
  timeoutMs?: number
  /** Forward tới `fetch` — dùng cho SSR storefront (vd. `no-store`). */
  cache?: RequestCache
  /** Forward tới `fetch` — ISR trên Next.js App Router. */
  next?: NextFetchRequestOptions
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    message?: string,
    public readonly request?: {
      method: string
      path: string
      url: string
    }
  ) {
    super(message ?? `${status} ${statusText}`)
    this.name = "ApiError"
  }
}

const buildUrl = (
  baseUrl: string,
  path: string,
  query?: RequestOptions["query"]
) => {
  const trimmedBase = baseUrl.replace(/\/+$/, "")
  const trimmedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${trimmedBase}${trimmedPath}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly defaultHeaders: Record<string, string>
  private readonly timeoutMs: number
  private readonly fetcher: typeof globalThis.fetch
  private readonly getAuthToken?: ApiClientOptions["getAuthToken"]
  private readonly getUserId?: ApiClientOptions["getUserId"]
  private readonly devLogging: boolean
  private readonly devLogTag: string
  private readonly getDevAuthContext?: ApiClientOptions["getDevAuthContext"]

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl
    this.defaultHeaders = options.headers ?? {}
    this.timeoutMs = options.timeoutMs ?? 15_000
    this.fetcher = options.fetch ?? globalThis.fetch.bind(globalThis)
    this.getAuthToken = options.getAuthToken
    this.getUserId = options.getUserId
    this.devLogging = defaultDevLogging(options)
    this.devLogTag = options.devLogTag ?? "api-client"
    this.getDevAuthContext = options.getDevAuthContext
    if (typeof globalThis !== "undefined") {
      setAdminApiBaseUrl(this.baseUrl)
    }
  }

  private async formatDevAuthSuffix(): Promise<string> {
    if (!this.getDevAuthContext) return ""
    try {
      const ctx = await this.getDevAuthContext()
      if (ctx === null || ctx === undefined || ctx === "") return ""
      const text = typeof ctx === "string" ? ctx : JSON.stringify(ctx)
      return ` | auth: ${text}`
    } catch {
      return " | auth: ?"
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options)
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, body, options)
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", path, body, options)
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", path, body, options)
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, undefined, options)
  }

  /** Tải binary (ZIP, file export) — không parse JSON. */
  async downloadBlob(
    path: string,
    options?: RequestOptions
  ): Promise<{ blob: Blob; headers: Headers }> {
    const url = buildUrl(this.baseUrl, path, options?.query)

    const headers: Record<string, string> = {
      Accept: "application/zip, application/octet-stream, */*",
      ...this.defaultHeaders,
      ...(options?.headers ?? {}),
    }

    const token = this.getAuthToken ? await this.getAuthToken() : undefined
    if (token) headers.Authorization = `Bearer ${token}`

    const userId = this.getUserId ? await this.getUserId() : undefined
    if (
      userId !== undefined &&
      userId !== null &&
      String(userId).trim() !== ""
    ) {
      headers["X-User-Id"] = String(userId).trim()
    }

    const controller = new AbortController()
    const timeoutMs = options?.timeoutMs ?? this.timeoutMs
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    if (options?.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      })
    }

    try {
      const response = await this.fetcher(url, {
        method: "GET",
        headers,
        signal: controller.signal,
        ...(options?.cache !== undefined ? { cache: options.cache } : {}),
        ...(options?.next !== undefined ? { next: options.next } : {}),
      })

      if (!response.ok) {
        const isJson = (response.headers.get("content-type") ?? "").includes(
          "application/json"
        )
        const payload: unknown = isJson
          ? await response.json().catch(() => null)
          : await response.text().catch(() => null)
        throw new ApiError(
          response.status,
          response.statusText,
          payload,
          extractMessage(payload) ??
            `${response.status} ${response.statusText}`
        )
      }

      const blob = await response.blob()
      return { blob, headers: response.headers }
    } finally {
      clearTimeout(timer)
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = buildUrl(this.baseUrl, path, options?.query)

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.defaultHeaders,
      ...(options?.headers ?? {}),
    }

    const token = this.getAuthToken ? await this.getAuthToken() : undefined
    if (token) headers.Authorization = `Bearer ${token}`

    const userId = this.getUserId ? await this.getUserId() : undefined
    if (
      userId !== undefined &&
      userId !== null &&
      String(userId).trim() !== ""
    ) {
      headers["X-User-Id"] = String(userId).trim()
    }

    if (body !== undefined && !(body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
    }

    const controller = new AbortController()
    const timeoutMs = options?.timeoutMs ?? this.timeoutMs
    let didTimeout = false
    const timer = setTimeout(() => {
      didTimeout = true
      controller.abort(new Error(`Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)
    if (options?.signal) {
      options.signal.addEventListener("abort", () => controller.abort(), {
        once: true,
      })
    }

    const t0 =
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
        ? performance.now()
        : Date.now()
    const startedAt = Date.now()
    const requestMeta = { method, path, url }

    const authSuffix = this.devLogging ? await this.formatDevAuthSuffix() : ""
    const reqBodyLog =
      this.devLogging && body !== undefined
        ? formatDevRequestBody(body)
        : undefined

    let response: Response
    try {
      response = await this.fetcher(url, {
        method,
        headers,
        body:
          body === undefined
            ? undefined
            : body instanceof FormData
              ? body
              : JSON.stringify(body),
        signal: controller.signal,
        ...(options?.cache !== undefined ? { cache: options.cache } : {}),
        ...(options?.next !== undefined ? { next: options.next } : {}),
      })
    } catch (err) {
      if (didTimeout) {
        recordAdminApiCall({
          method,
          path,
          url,
          status: 408,
          statusText: "Request Timeout",
          ok: false,
          startedAt,
          completedAt: Date.now(),
          ms: Date.now() - startedAt,
          requestBody: summarizeRequestBodyForTrace(body),
        })
        throw new ApiError(
          408,
          "Request Timeout",
          null,
          `Yeu cau API qua han sau ${timeoutMs}ms`,
          requestMeta
        )
      }
      if (this.devLogging && !isAbortLikeError(err)) {
        const ms =
          (typeof performance !== "undefined" &&
          typeof performance.now === "function"
            ? performance.now()
            : Date.now()) - t0
        printDevApiNetworkError({
          tag: this.devLogTag,
          method,
          path,
          url,
          ms,
          authSuffix,
          err,
        })
      }
      if (!isAbortLikeError(err)) {
        recordAdminApiCall({
          method,
          path,
          url,
          ok: false,
          startedAt,
          completedAt: Date.now(),
          ms: Date.now() - startedAt,
          requestBody: summarizeRequestBodyForTrace(body),
        })
      }
      throw err
    } finally {
      clearTimeout(timer)
    }

    if (response.status === 204) {
      if (this.devLogging) {
        const ms =
          (typeof performance !== "undefined" &&
          typeof performance.now === "function"
            ? performance.now()
            : Date.now()) - t0
        printDevApiCall({
          tag: this.devLogTag,
          method,
          path,
          status: 204,
          ms,
          reqBodyText: reqBodyLog,
          authSuffix,
          respSummary: "204 — không có body",
        })
      }
      recordAdminApiCall({
        method,
        path,
        url,
        status: 204,
        statusText: response.statusText,
        ok: true,
        startedAt,
        completedAt: Date.now(),
        ms: Date.now() - startedAt,
        requestBody: summarizeRequestBodyForTrace(body),
      })
      return undefined as T
    }

    const isJson = (response.headers.get("content-type") ?? "").includes(
      "application/json"
    )
    const payload: unknown = isJson
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (this.devLogging) {
      const ms =
        (typeof performance !== "undefined" &&
        typeof performance.now === "function"
          ? performance.now()
          : Date.now()) - t0
      const respSummary = formatDevResponsePayload(
        response.status,
        payload,
        response.ok
      )
      const stateHint = formatDevApiStateHint(
        path,
        method,
        payload,
        response.ok
      )
      const responseJson = buildDevLogResponseJson(path, response.ok, payload)
      printDevApiCall({
        tag: this.devLogTag,
        method,
        path,
        status: response.status,
        ms,
        reqBodyText: reqBodyLog,
        authSuffix,
        respSummary,
        stateHint,
        responseJson,
      })
    }

    if (!response.ok) {
      recordAdminApiCall({
        method,
        path,
        url,
        status: response.status,
        statusText: response.statusText,
        ok: false,
        startedAt,
        completedAt: Date.now(),
        ms: Date.now() - startedAt,
        requestBody: summarizeRequestBodyForTrace(body),
      })
      throw new ApiError(
        response.status,
        response.statusText,
        payload,
        extractMessage(payload) ?? `${response.status} ${response.statusText}`,
        requestMeta
      )
    }

    recordAdminApiCall({
      method,
      path,
      url,
      status: response.status,
      statusText: response.statusText,
      ok: true,
      startedAt,
      completedAt: Date.now(),
      ms: Date.now() - startedAt,
      requestBody: summarizeRequestBodyForTrace(body),
    })

    return payload as T
  }
}

function summarizeRequestBodyForTrace(body: unknown): unknown {
  if (body === undefined) return undefined
  if (body instanceof FormData) {
    const fields: string[] = []
    body.forEach((value, key) => {
      if (value instanceof File) {
        fields.push(`${key}: File(${value.name}, ${value.size}b)`)
      } else {
        fields.push(`${key}: ${String(value)}`)
      }
    })
    return { _formData: fields }
  }
  return body
}

const extractMessage = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== "object") return undefined
  const record = payload as Record<string, unknown>
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim()
  }
  if (Array.isArray(record.message)) return record.message.join(", ")
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim()
  }
  return undefined
}
