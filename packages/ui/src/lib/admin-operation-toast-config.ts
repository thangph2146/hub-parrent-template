import type { MutationKey } from "@tanstack/react-query"
import {
  ApiError,
  buildAdminApiUrl,
  type AdminApiCallRecord,
} from "@workspace/api-client"
import {
  formatAdminOperationErrorDetails,
  resolveAdminOperationError,
} from "./admin-operation-error"
import type { HubToastOptions } from "./hub-toast-types"

/** Cấu hình chung toast thao tác admin — chỉnh một chỗ cho mọi mutation/query. */
export const adminOperationToastConfig = {
  /** Development: gắn báo cáo đầy đủ vào nút Sao chép (không hiển thị trong toast). */
  devFullCopyReport: process.env.NODE_ENV === "development",
  /** Giới hạn ký tự JSON trong báo cáo copy. */
  maxJsonChars: 12_000,
  reportHeader: "BÁO CÁO THAO TÁC — HUB ADMIN",
} as const

export type AdminApiMeta = {
  method: string
  path: string | ((variables: unknown) => string)
}

const REDACT_KEYS = new Set(
  [
    "password",
    "currentpassword",
    "newpassword",
    "currentPassword",
    "newPassword",
    "token",
    "accesstoken",
    "refreshtoken",
    "secret",
    "authorization",
    "credential",
  ].map((k) => k.toLowerCase()),
)

function redactDeep(value: unknown, depth = 6): unknown {
  if (depth <= 0) return "…"
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactDeep(item, depth - 1))
  }
  if (typeof value !== "object") return value
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    out[key] = REDACT_KEYS.has(key.toLowerCase()) ? "[redacted]" : redactDeep(val, depth - 1)
  }
  return out
}

function safeJsonStringify(value: unknown): string {
  const max = adminOperationToastConfig.maxJsonChars
  try {
    const text = JSON.stringify(redactDeep(value), null, 2)
    if (text.length <= max) return text
    return `${text.slice(0, max)}\n… (+${text.length - max} ký tự)`
  } catch {
    return String(value)
  }
}

export function formatMutationKeyLabel(key: MutationKey | undefined): string | undefined {
  if (!key || !Array.isArray(key) || key.length === 0) return undefined
  const parts = key.map((part) => String(part)).filter(Boolean)
  if (parts.length === 0) return undefined
  return parts.join(" / ")
}

function extractMutationEntityId(variables: unknown): string | undefined {
  if (variables == null || typeof variables !== "object") return undefined
  const v = variables as Record<string, unknown>
  if (typeof v.id === "string" || typeof v.id === "number") {
    return String(v.id)
  }
  return undefined
}

function resolveAdminApiPath(
  path: string | ((variables: unknown) => string),
  variables?: unknown,
): string {
  return typeof path === "function" ? path(variables) : path
}

/** Gợi ý endpoint theo mutationKey — fallback khi trace HTTP trống. */
export function inferAdminApiFromMutationKey(
  key: MutationKey | undefined,
  variables?: unknown,
): AdminApiMeta | undefined {
  if (!key || !Array.isArray(key) || key.length < 2) return undefined
  const resource = String(key[0])
  const action = String(key[1])
  const hintKey = `${resource}:${action}`

  const hints: Record<string, AdminApiMeta> = {
    "account:update": { method: "PUT", path: "/admin/accounts" },
    "account:changePassword": { method: "PUT", path: "/admin/accounts" },
    "profile:update": {
      method: "PUT",
      path: (vars) => {
        const id = extractMutationEntityId(vars)
        return id ? `/admin/users/${id}` : "/admin/users/:id"
      },
    },
    "profile:change-password": {
      method: "PUT",
      path: (vars) => {
        const id = extractMutationEntityId(vars)
        return id ? `/admin/users/${id}` : "/admin/users/:id"
      },
    },
  }

  return hints[hintKey]
}

export function adminApiMeta(meta: AdminApiMeta): { adminApi: AdminApiMeta } {
  return { adminApi: meta }
}

export function buildAdminApiCallFromMeta(
  meta: AdminApiMeta,
  options?: {
    variables?: unknown
    data?: unknown
    error?: unknown
    status?: number
    statusText?: string
  },
): AdminApiCallRecord {
  const path = resolveAdminApiPath(meta.path, options?.variables)
  const now = Date.now()
  let status = options?.status
  let statusText = options?.statusText
  let ok: boolean | undefined

  if (options?.error instanceof ApiError) {
    status = options.error.status
    statusText = options.error.statusText
    ok = false
  } else if (options?.data !== undefined) {
    status = status ?? 200
    statusText = statusText ?? "OK"
    ok = true
  }

  return {
    method: meta.method.toUpperCase(),
    path,
    url: buildAdminApiUrl(path),
    status,
    statusText,
    ok,
    startedAt: now,
    completedAt: now,
    ms: 0,
    requestBody: options?.variables,
  }
}

export type AdminOperationReviewContext = {
  mutationKey?: MutationKey
  variables?: unknown
  data?: unknown
  error?: unknown
  operationLabel?: string
  /** HTTP gọi trong lúc mutation (tự thu từ ApiClient). */
  apiCalls?: AdminApiCallRecord[]
  /** Gợi ý endpoint khi trace trống. */
  adminApi?: AdminApiMeta
}

function formatApiCallStatus(call: AdminApiCallRecord): string {
  if (call.status == null) return "—"
  const text = call.statusText?.trim()
  return text ? `${call.status} ${text}` : String(call.status)
}

function formatAdminApiCallsSection(calls: AdminApiCallRecord[]): string[] {
  if (calls.length === 0) return []
  const lines: string[] = [
    "",
    calls.length === 1 ? "── API call ──" : `── API calls (${calls.length}) ──`,
  ]
  calls.forEach((call, index) => {
    if (calls.length > 1) lines.push(``, `#${index + 1}`)
    lines.push(`${call.method} ${call.path}`)
    lines.push(`URL: ${call.url}`)
    lines.push(`Status: ${formatApiCallStatus(call)}`)
    if (call.ms > 0) lines.push(`Duration: ${call.ms}ms`)
    if (call.requestBody !== undefined) {
      lines.push("Request body:", safeJsonStringify(call.requestBody))
    }
  })
  return lines
}

export function resolveAdminApiCallsForReview(
  ctx: AdminOperationReviewContext,
): AdminApiCallRecord[] {
  if (ctx.apiCalls?.length) return ctx.apiCalls

  if (ctx.error instanceof ApiError && ctx.error.request) {
    return [
      {
        method: ctx.error.request.method,
        path: ctx.error.request.path,
        url: ctx.error.request.url,
        status: ctx.error.status,
        statusText: ctx.error.statusText,
        ok: false,
        startedAt: Date.now(),
        completedAt: Date.now(),
        ms: 0,
        requestBody: ctx.variables,
      },
    ]
  }

  const meta =
    ctx.adminApi ?? inferAdminApiFromMutationKey(ctx.mutationKey, ctx.variables)
  if (meta) {
    return [
      buildAdminApiCallFromMeta(meta, {
        variables: ctx.variables,
        data: ctx.data,
        error: ctx.error,
      }),
    ]
  }

  return []
}

export function formatAdminOperationReviewReport(
  ctx: AdminOperationReviewContext,
): string {
  const lines: string[] = [
    adminOperationToastConfig.reportHeader,
    "",
    `Thời gian: ${new Date().toISOString()}`,
  ]

  const label =
    ctx.operationLabel?.trim() || formatMutationKeyLabel(ctx.mutationKey)
  if (label) lines.push(`Thao tác: ${label}`)
  if (ctx.mutationKey) {
    lines.push(`Mutation key: ${JSON.stringify(ctx.mutationKey)}`)
  }

  const apiCalls = resolveAdminApiCallsForReview(ctx)
  lines.push(...formatAdminApiCallsSection(apiCalls))

  if (ctx.variables !== undefined) {
    lines.push("", "── Request (variables) ──", safeJsonStringify(ctx.variables))
  }

  if (ctx.error !== undefined) {
    lines.push("", "── Lỗi ──", formatAdminOperationErrorDetails(ctx.error))
    if (ctx.error instanceof ApiError) {
      lines.push("", "── API error body ──", safeJsonStringify(ctx.error.body))
    }
  }

  if (ctx.data !== undefined) {
    lines.push("", "── API response (payload) ──", safeJsonStringify(ctx.data))
  }

  const reqStudentCode =
    ctx.variables &&
    typeof ctx.variables === "object" &&
    "studentCode" in ctx.variables
      ? (ctx.variables as { studentCode?: unknown }).studentCode
      : undefined
  const resStudentCode =
    ctx.data &&
    typeof ctx.data === "object" &&
    "studentCode" in ctx.data
      ? (ctx.data as { studentCode?: unknown }).studentCode
      : undefined
  if (
    reqStudentCode != null &&
    String(reqStudentCode).trim() !== "" &&
    (resStudentCode == null || String(resStudentCode).trim() === "")
  ) {
    lines.push(
      "",
      "⚠ Cảnh báo: Request có studentCode nhưng response không trả về — kiểm tra API (controller whitelist / service resolve).",
    )
  }

  lines.push(
    "",
    "Ghi chú: Báo cáo dùng cho review/debug — không chứa mật khẩu (đã redact).",
  )

  return lines.join("\n")
}

export type AdminOperationToastPayload = {
  /** Dòng hiển thị trên toast — kết quả ngắn gọn. */
  message: string
  /** Báo cáo copy (dev) — không render trong toast. */
  copyReport?: string
  /** Mô tả hiển thị (prod hoặc override tùy chỉnh ngắn). */
  description?: string
}

export function adminOperationToastPayloadToOptions(
  payload: AdminOperationToastPayload,
  extra?: Pick<HubToastOptions, "id" | "duration">,
): HubToastOptions {
  const opts: HubToastOptions = { ...extra }
  if (payload.description) opts.description = payload.description
  if (payload.copyReport) opts.copyReport = payload.copyReport
  return opts
}

export function buildAdminOperationSuccessToast(
  message: string,
  ctx: AdminOperationReviewContext,
  customDescription?: string,
): AdminOperationToastPayload {
  const trimmedMessage = message.trim() || "Đã thực hiện thành công"
  const custom = customDescription?.trim()

  if (custom) {
    return { message: trimmedMessage, description: custom }
  }

  if (!adminOperationToastConfig.devFullCopyReport) {
    return { message: trimmedMessage }
  }

  return {
    message: trimmedMessage,
    copyReport: formatAdminOperationReviewReport(ctx),
  }
}

export function buildAdminOperationErrorToastPayload(
  message: string,
  ctx: AdminOperationReviewContext,
  customDescription?: string,
): AdminOperationToastPayload {
  const trimmedMessage = message.trim() || "Không thực hiện được thao tác"
  const custom = customDescription?.trim()

  if (custom) {
    return { message: trimmedMessage, description: custom }
  }

  if (!adminOperationToastConfig.devFullCopyReport) {
    return { message: trimmedMessage }
  }

  return {
    message: trimmedMessage,
    copyReport: formatAdminOperationReviewReport({
      ...ctx,
      error: ctx.error,
    }),
  }
}

export function buildAdminOperationErrorToast(
  err: unknown,
  title?: string,
): AdminOperationToastPayload {
  return buildAdminOperationErrorToastPayload(
    title?.trim() || resolveAdminOperationError(err),
    { error: err },
  )
}
