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
import type { ToastOptions } from "./toast-types"
import {
  formatAdminOperationReportBrandingSection,
  resolveAdminOperationReportHeader,
} from "./admin-operation-report-branding"
import { formatDurationMs } from "./toast-copy-timing"

/** Cấu hình chung toast thao tác admin — chỉnh một chỗ cho mọi mutation/query. */
export const adminOperationToastConfig = {
  /** Gắn báo cáo đầy đủ vào nút Sao chép (không hiển thị trong toast UI). */
  devFullCopyReport: true,
  /** Giới hạn ký tự JSON trong báo cáo copy. */
  maxJsonChars: 12_000,
} as const

export type AdminApiMeta = {
  method: string
  path: string | ((variables: unknown) => string)
}

/** Mutation key module → segment API admin. */
const MUTATION_RESOURCE_ALIASES: Record<string, string> = {
  rbac: "roles",
}

function resolveApiResourceFromMutationKey(resource: string): string {
  return MUTATION_RESOURCE_ALIASES[resource] ?? resource
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

const BULK_ACTION_VI: Record<string, string> = {
  delete: "xóa",
  restore: "khôi phục",
  "hard-delete": "xóa vĩnh viễn",
  purge: "xóa vĩnh viễn",
}

export function resolveBulkOperationToastMessage(
  variables: { action?: string; ids?: string[] },
  unitLabel = "mục",
): string {
  const count = variables.ids?.length ?? 0
  const action = String(variables.action ?? "").trim()
  if (action === "delete") {
    return `Bulk: Đã đưa ${count} ${unitLabel} vào thùng rác`
  }
  if (action === "restore") {
    return `Bulk: Đã khôi phục ${count} ${unitLabel}`
  }
  if (action === "hard-delete" || action === "purge") {
    return `Bulk: Đã xóa vĩnh viễn ${count} ${unitLabel}`
  }
  return `Bulk: Đã xử lý ${count} ${unitLabel}`
}

function formatBulkOperationLabel(
  ctx: AdminOperationReviewContext,
  apiResource: string,
  scope: AdminOperationScopeInfo,
): string {
  const bulkAction = scope.action ?? "mutate"
  const actionVi = BULK_ACTION_VI[bulkAction] ?? bulkAction
  const count = scope.ids.length
  const countPart = count > 0 ? ` (${count} mục)` : ""
  return `Bulk — ${actionVi} ${apiResource}${countPart}`
}

function resolveBulkUnitLabelFromMutationKey(
  key: MutationKey | undefined,
): string {
  if (!key || !Array.isArray(key) || key.length === 0) return "mục"
  const resource = String(key[0] ?? "").toLowerCase()
  if (resource === "rbac" || resource === "roles") return "vai trò"
  return "mục"
}

function formatAdminOperationLabel(
  ctx: AdminOperationReviewContext,
  apiCalls: AdminApiCallRecord[],
): string | undefined {
  if (ctx.operationLabel?.trim()) return ctx.operationLabel.trim()

  const apiResource =
    (Array.isArray(ctx.mutationKey) && ctx.mutationKey[0]
      ? resolveApiResourceFromMutationKey(String(ctx.mutationKey[0]))
      : undefined) ??
    (apiCalls[0] ? parseAdminResourceFromPath(apiCalls[0].path) : undefined) ??
    "resource"

  const scope = resolveOperationScope(ctx, apiCalls)
  if (scope.scope === "bulk") {
    return formatBulkOperationLabel(ctx, apiResource, scope)
  }

  return formatMutationKeyLabel(ctx.mutationKey)
}

function extractMutationEntityId(variables: unknown): string | undefined {
  if (typeof variables === "string" || typeof variables === "number") {
    const id = String(variables).trim()
    return id || undefined
  }
  if (variables == null || typeof variables !== "object") return undefined
  const v = variables as Record<string, unknown>
  if (typeof v.id === "string" || typeof v.id === "number") {
    return String(v.id)
  }
  return undefined
}

function extractMutationIds(variables: unknown): string[] {
  if (typeof variables === "string" || typeof variables === "number") {
    const id = String(variables).trim()
    return id ? [id] : []
  }
  if (variables == null || typeof variables !== "object") return []
  const v = variables as Record<string, unknown>
  if (typeof v.id === "string" || typeof v.id === "number") {
    return [String(v.id)]
  }
  if (!Array.isArray(v.ids)) {
    if (Array.isArray(v.paths)) {
      return v.paths
        .map((path) =>
          typeof path === "string" || typeof path === "number"
            ? String(path).trim()
            : "",
        )
        .filter(Boolean)
    }
    return []
  }
  return v.ids
    .map((id) => (typeof id === "string" || typeof id === "number" ? String(id).trim() : ""))
    .filter(Boolean)
}

function extractMutationAction(
  ctx: AdminOperationReviewContext,
): string | undefined {
  if (ctx.variables != null && typeof ctx.variables === "object") {
    const action = (ctx.variables as { action?: unknown }).action
    if (typeof action === "string" && action.trim()) return action.trim()
  }
  if (Array.isArray(ctx.mutationKey) && ctx.mutationKey.length > 1) {
    const action = String(ctx.mutationKey[1] ?? "").trim()
    return action || undefined
  }
  return undefined
}

type AdminOperationScope = "single" | "bulk"

type AdminOperationScopeInfo = {
  scope: AdminOperationScope
  action?: string
  ids: string[]
  /** Nguồn suy luận phạm vi — debug. */
  source: string
}

function isBulkApiPath(path: string): boolean {
  const normalized = path.split("?")[0] ?? path
  return (
    /\/bulk\/?$/i.test(normalized) || /\/bulk-delete\/?$/i.test(normalized)
  )
}

const RESERVED_ADMIN_PATH_SEGMENTS = new Set([
  "bulk",
  "bulk-delete",
  "options",
  "permissions",
])

function parseAdminResourceFromPath(path: string): string | undefined {
  const match = path.match(/\/admin\/([a-z0-9-]+)/i)
  return match?.[1]?.toLowerCase()
}

function resolveOperationScope(
  ctx: AdminOperationReviewContext,
  apiCalls: AdminApiCallRecord[],
): AdminOperationScopeInfo {
  const mutationAction =
    Array.isArray(ctx.mutationKey) && ctx.mutationKey.length > 1
      ? String(ctx.mutationKey[1])
      : undefined
  const action = extractMutationAction(ctx)
  const idsFromVars = extractMutationIds(ctx.variables)

  if (mutationAction === "bulk") {
    return {
      scope: "bulk",
      action,
      ids: idsFromVars,
      source: "mutationKey=bulk",
    }
  }

  const primaryCall = apiCalls[0]
  if (primaryCall && isBulkApiPath(primaryCall.path)) {
    const bodyIds = extractMutationIds(primaryCall.requestBody)
    const varIds = extractMutationIds(ctx.variables)
    const ids = bodyIds.length > 0 ? bodyIds : varIds
    const isUploadsBulkDelete = /\/uploads\/bulk-delete/i.test(primaryCall.path)
    return {
      scope: "bulk",
      action: action ?? (isUploadsBulkDelete ? "delete" : undefined),
      ids,
      source: isUploadsBulkDelete ? "apiCall=/uploads/bulk-delete" : "apiCall=/bulk",
    }
  }

  if (
    ctx.variables != null &&
    typeof ctx.variables === "object" &&
    Array.isArray((ctx.variables as { ids?: unknown }).ids)
  ) {
    return {
      scope: "bulk",
      action,
      ids: idsFromVars,
      source: "variables.ids[]",
    }
  }

  if (typeof ctx.variables === "string" && ctx.variables.trim()) {
    return {
      scope: "single",
      action,
      ids: [ctx.variables.trim()],
      source: "variables=id-string",
    }
  }

  if (idsFromVars.length === 1) {
    return {
      scope: "single",
      action,
      ids: idsFromVars,
      source: "variables.id",
    }
  }

  if (primaryCall && !isBulkApiPath(primaryCall.path)) {
    const resource = parseAdminResourceFromPath(primaryCall.path)
    const pathMatch = primaryCall.path.match(
      /\/admin\/[a-z0-9-]+\/([^/?]+)(?:\/([^/?]+))?/i,
    )
    const seg2 = pathMatch?.[1]
    const seg3 = pathMatch?.[2]
    let inferredAction = action
    if (!inferredAction && seg3 === "restore") inferredAction = "restore"
    else if (!inferredAction && seg3 === "hard-delete") inferredAction = "purge"
    else if (!inferredAction && primaryCall.method === "DELETE" && seg2 && !seg3) {
      inferredAction = "delete"
    }
    const idFromPath =
      seg2 &&
      !RESERVED_ADMIN_PATH_SEGMENTS.has(seg2) &&
      seg2 !== "bulk" &&
      seg2 !== "options" &&
      seg2 !== "permissions"
        ? seg2
        : undefined
    return {
      scope: "single",
      action: inferredAction,
      ids: idFromPath ? [idFromPath] : idsFromVars,
      source: resource ? `apiCall=${primaryCall.method} ${primaryCall.path}` : "apiCall",
    }
  }

  return {
    scope: idsFromVars.length > 1 ? "bulk" : "single",
    action,
    ids: idsFromVars,
    source: "fallback",
  }
}

function formatScopeLabel(scope: AdminOperationScopeInfo): string {
  const count = scope.ids.length
  if (scope.scope === "bulk") {
    return count > 0
      ? `hàng loạt (bulk) — ${count} mục`
      : "hàng loạt (bulk)"
  }
  return count > 0 ? `đơn lẻ — 1 mục` : "đơn lẻ"
}

function describeExpectedApiLines(
  scope: AdminOperationScopeInfo,
  apiResource: string,
): string[] {
  const action = scope.action ?? "mutate"
  const bulkAction =
    action === "purge" || action === "hard-delete" ? "hard-delete" : action

  if (scope.scope === "bulk") {
    const idsJson = safeJsonStringify({
      action: bulkAction,
      ids: scope.ids.length > 0 ? scope.ids : ["…"],
    })
    return [
      `POST /admin/${apiResource}/bulk`,
      "Request body (kỳ vọng):",
      idsJson,
    ]
  }

  const id = scope.ids[0] ?? ":id"
  if (action === "delete") return [`DELETE /admin/${apiResource}/${id}`]
  if (action === "restore") return [`POST /admin/${apiResource}/${id}/restore`]
  if (action === "purge" || action === "hard-delete") {
    return [`DELETE /admin/${apiResource}/${id}/hard-delete`]
  }
  return [`${action.toUpperCase()} /admin/${apiResource}/${id}`]
}

function assessApiConformance(
  scope: AdminOperationScopeInfo,
  apiResource: string,
  apiCalls: AdminApiCallRecord[],
): string[] {
  const lines: string[] = ["", "── Đối chiếu API chuẩn ──"]
  const primary = apiCalls[0]

  if (!primary) {
    lines.push("⚠ Chưa có HTTP trace — chỉ suy luận từ mutationKey/variables.")
    lines.push(`Phạm vi kỳ vọng: ${formatScopeLabel(scope)}`)
    lines.push("API kỳ vọng:")
    lines.push(...describeExpectedApiLines(scope, apiResource).map((l) => `  ${l}`))
    return lines
  }

  const usedBulk = isBulkApiPath(primary.path)
  const expectedBulk = scope.scope === "bulk"

  if (expectedBulk && usedBulk) {
    const bodyAction =
      primary.requestBody != null &&
      typeof primary.requestBody === "object"
        ? String((primary.requestBody as { action?: unknown }).action ?? "").trim()
        : ""
    const bodyIds = extractMutationIds(primary.requestBody)
    const expectedAction =
      scope.action === "purge" || scope.action === "hard-delete"
        ? "hard-delete"
        : scope.action ?? ""

    lines.push("✓ Đúng chuẩn bulk — POST /admin/…/bulk")
    if (expectedAction && bodyAction && bodyAction !== expectedAction) {
      lines.push(
        `⚠ action trong body "${bodyAction}" ≠ kỳ vọng "${expectedAction}"`,
      )
    }
    if (scope.ids.length > 0 && bodyIds.length > 0 && bodyIds.length !== scope.ids.length) {
      lines.push(
        `⚠ Số id trong body (${bodyIds.length}) ≠ variables (${scope.ids.length})`,
      )
    }
    return lines
  }

  if (!expectedBulk && !usedBulk) {
    const expectedLines = describeExpectedApiLines(scope, apiResource)
    const expectedPath = expectedLines[0] ?? ""
    const pathMatches =
      primary.method.toUpperCase() === expectedPath.split(" ")[0]?.toUpperCase() &&
      primary.path.replace(/\?.*$/, "") === expectedPath.split(" ")[1]

    if (pathMatches) {
      lines.push("✓ Đúng chuẩn đơn lẻ — không dùng /bulk")
    } else {
      lines.push("✓ Phạm vi đơn lẻ — không gọi /bulk")
      lines.push(`  Thực tế: ${primary.method} ${primary.path}`)
      lines.push(`  Kỳ vọng: ${expectedPath}`)
    }
    if (scope.ids.length === 1 && !primary.path.includes(`/${scope.ids[0]}`)) {
      lines.push(`⚠ Path không chứa id "${scope.ids[0]}"`)
    }
    return lines
  }

  if (expectedBulk && !usedBulk) {
    lines.push("✗ SAI CHUẨN — mutation bulk nhưng không gọi POST …/bulk")
    lines.push(`  Thực tế: ${primary.method} ${primary.path}`)
    lines.push("  Kỳ vọng:")
    lines.push(
      ...describeExpectedApiLines(scope, apiResource).map((l) => `    ${l}`),
    )
    return lines
  }

  // single expected but bulk used
  lines.push("✗ SAI CHUẨN — thao tác 1 mục không nên dùng POST …/bulk")
  lines.push(`  Thực tế: ${primary.method} ${primary.path}`)
  if (scope.ids.length === 1) {
    lines.push("  Kỳ vọng (đơn lẻ):")
    lines.push(
      ...describeExpectedApiLines(scope, apiResource).map((l) => `    ${l}`),
    )
  }
  return lines
}

function formatOperationScopeSection(
  ctx: AdminOperationReviewContext,
  apiCalls: AdminApiCallRecord[],
): string[] {
  const apiResource =
    (Array.isArray(ctx.mutationKey) && ctx.mutationKey[0]
      ? resolveApiResourceFromMutationKey(String(ctx.mutationKey[0]))
      : undefined) ??
    (apiCalls[0] ? parseAdminResourceFromPath(apiCalls[0].path) : undefined) ??
    "resource"

  const scope = resolveOperationScope(ctx, apiCalls)
  const lines: string[] = [
    "",
    "── Phạm vi thao tác ──",
    `Loại: ${formatScopeLabel(scope)}`,
  ]

  if (scope.action) lines.push(`Action: ${scope.action}`)
  if (scope.ids.length > 0) {
    lines.push(
      scope.scope === "bulk"
        ? `IDs (${scope.ids.length}): ${safeJsonStringify(scope.ids)}`
        : `ID: ${scope.ids[0]}`,
    )
  }
  lines.push(`Nguồn suy luận: ${scope.source}`)

  lines.push("", "── API chuẩn (kỳ vọng) ──")
  lines.push(...describeExpectedApiLines(scope, apiResource))
  lines.push(...assessApiConformance(scope, apiResource, apiCalls))

  return lines
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

  const hinted = hints[hintKey]
  if (hinted) return hinted

  const apiResource = resolveApiResourceFromMutationKey(resource)

  if (action === "bulk") {
    return { method: "POST", path: `/admin/${apiResource}/bulk` }
  }

  if (typeof variables === "string" && variables.trim()) {
    const id = variables.trim()
    if (action === "delete") {
      return { method: "DELETE", path: `/admin/${apiResource}/${id}` }
    }
    if (action === "restore") {
      return { method: "POST", path: `/admin/${apiResource}/${id}/restore` }
    }
    if (action === "purge") {
      return { method: "DELETE", path: `/admin/${apiResource}/${id}/hard-delete` }
    }
  }

  return undefined
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

function formatApiCallStatus(call: AdminApiCallRecord, now = Date.now()): string {
  if (call.pending) {
    return `đang chờ response (${formatDurationMs(Math.max(0, now - call.startedAt))})`
  }
  if (call.status == null) return "—"
  const text = call.statusText?.trim()
  return text ? `${call.status} ${text}` : String(call.status)
}

function formatAdminApiCallsSection(calls: AdminApiCallRecord[]): string[] {
  if (calls.length === 0) return []
  const now = Date.now()
  const lines: string[] = [
    "",
    calls.length === 1 ? "── API call ──" : `── API calls (${calls.length}) ──`,
  ]
  calls.forEach((call, index) => {
    if (calls.length > 1) lines.push(``, `#${index + 1}`)
    lines.push(`${call.method} ${call.path}`)
    lines.push(`URL: ${call.url}`)
    lines.push(`Status: ${formatApiCallStatus(call, now)}`)
    if (!call.pending && call.ms > 0) lines.push(`Duration: ${call.ms}ms`)
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

function normalizeVariablesForReviewReport(
  ctx: AdminOperationReviewContext,
): unknown {
  if (typeof ctx.variables === "string" && ctx.variables.trim()) {
    return { id: ctx.variables.trim() }
  }
  if (typeof ctx.variables === "number" && Number.isFinite(ctx.variables)) {
    return { id: String(ctx.variables) }
  }
  return ctx.variables
}

function extractStoragePaths(variables: unknown): string[] {
  if (typeof variables === "string" && variables.trim()) {
    return [variables.trim()]
  }
  if (variables == null || typeof variables !== "object") return []
  const v = variables as Record<string, unknown>
  if (typeof v.path === "string" && v.path.trim()) return [v.path.trim()]
  if (!Array.isArray(v.paths)) return []
  return v.paths
    .map((path) =>
      typeof path === "string" || typeof path === "number"
        ? String(path).trim()
        : "",
    )
    .filter(Boolean)
}

function pickStorageApiCalls(
  calls: AdminApiCallRecord[],
  adminApi?: { method: string; path: string },
): AdminApiCallRecord[] {
  if (!calls.length) return []
  if (adminApi) {
    const matched = calls.filter(
      (call) =>
        call.method.toUpperCase() === adminApi.method.toUpperCase() &&
        call.path.replace(/\?.*$/, "") === adminApi.path,
    )
    if (matched.length) return matched
  }
  const uploadMutations = calls.filter(
    (call) =>
      /\/admin\/uploads/i.test(call.path) &&
      ["POST", "DELETE", "PUT", "PATCH"].includes(call.method.toUpperCase()),
  )
  return uploadMutations.length ? uploadMutations : calls.slice(-1)
}

export type StorageOperationCopyReportInput = {
  operationLabel: string
  variables?: unknown
  data?: unknown
  error?: unknown
  adminApi?: { method: string; path: string }
  apiCalls?: AdminApiCallRecord[]
}

/** Báo cáo copy cho thao tác file storage — không dùng heuristics CRUD bulk. */
export function formatStorageOperationCopyReport(
  input: StorageOperationCopyReportInput,
): string {
  const lines: string[] = [
    resolveAdminOperationReportHeader(),
    ...formatAdminOperationReportBrandingSection(),
    "",
    `Thao tác: ${input.operationLabel}`,
  ]

  const paths = extractStoragePaths(input.variables)
  lines.push("", "── File storage ──")
  if (paths.length === 1) {
    lines.push(`Đường dẫn: ${paths[0]}`)
  } else if (paths.length > 1) {
    lines.push(`Số file: ${paths.length}`)
    lines.push("Paths:", safeJsonStringify(paths))
  } else if (input.variables !== undefined) {
    lines.push("Request:", safeJsonStringify(input.variables))
  } else {
    lines.push("Không có path trong request.")
  }

  if (input.adminApi) {
    lines.push(
      "",
      "── API ──",
      `${input.adminApi.method.toUpperCase()} ${input.adminApi.path}`,
    )
  }

  const apiCalls = pickStorageApiCalls(input.apiCalls ?? [], input.adminApi)
  if (apiCalls.length > 0) {
    lines.push(...formatAdminApiCallsSection(apiCalls))
    if (apiCalls.some((call) => call.pending)) {
      lines.push(
        "",
        "Gợi ý: Sao chép lại sau khi toast success/error để có response đầy đủ.",
      )
    }
  } else if (input.error === undefined && input.data === undefined) {
    lines.push(
      "",
      "── HTTP trace ──",
      "Trạng thái: Toast loading — chưa ghi nhận request (có thể chưa gửi API).",
      "Gợi ý: Sao chép lại sau khi toast chuyển success/error.",
    )
  } else {
    lines.push(
      "",
      "── HTTP trace ──",
      "⚠ Không ghi nhận được HTTP trace cho thao tác này.",
    )
  }

  if (input.error !== undefined) {
    lines.push("", "── Lỗi ──", formatAdminOperationErrorDetails(input.error))
    if (input.error instanceof ApiError) {
      lines.push("", "── API error body ──", safeJsonStringify(input.error.body))
    }
  }

  if (input.data !== undefined) {
    lines.push("", "── Response ──", safeJsonStringify(input.data))
  }

  lines.push(
    "",
    "Ghi chú: Báo cáo file storage — không chứa mật khẩu (đã redact).",
  )

  return lines.join("\n")
}

export function formatAdminOperationReviewReport(
  ctx: AdminOperationReviewContext,
): string {
  const lines: string[] = [
    resolveAdminOperationReportHeader(),
    ...formatAdminOperationReportBrandingSection(),
  ]

  const apiCalls = resolveAdminApiCallsForReview(ctx)
  const label = formatAdminOperationLabel(ctx, apiCalls)
  if (label) lines.push(`Thao tác: ${label}`)
  if (ctx.mutationKey) {
    lines.push(`Mutation key: ${JSON.stringify(ctx.mutationKey)}`)
  }

  const scope = resolveOperationScope(ctx, apiCalls)
  if (scope.scope === "bulk" && ctx.variables != null && typeof ctx.variables === "object") {
    const unitLabel = resolveBulkUnitLabelFromMutationKey(ctx.mutationKey)
    lines.push(
      "",
      "── Thông báo UI (toast bulk) ──",
      resolveBulkOperationToastMessage(
        ctx.variables as { action?: string; ids?: string[] },
        unitLabel,
      ),
    )
  }

  lines.push(...formatOperationScopeSection(ctx, apiCalls))
  lines.push(...formatAdminApiCallsSection(apiCalls))

  if (ctx.variables !== undefined) {
    lines.push(
      "",
      "── Request (variables) ──",
      safeJsonStringify(normalizeVariablesForReviewReport(ctx)),
    )
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

export function formatRealtimeNotificationCopyReport(
  payload: import("@workspace/api-client/realtime").SocketNotificationPayload,
): string {
  const meta = payload.metadata
  const bulkIds = Array.isArray(meta?.ids)
    ? meta.ids
        .map((id) => (typeof id === "string" || typeof id === "number" ? String(id) : ""))
        .filter(Boolean)
    : []
  const singleId =
    meta?.resourceId != null ? String(meta.resourceId) : undefined
  const isBulk = bulkIds.length > 0
  const scopeLines = [
    "",
    "── Phạm vi (socket metadata) ──",
    isBulk
      ? `Loại: hàng loạt (bulk) — ${bulkIds.length} mục`
      : singleId
        ? "Loại: đơn lẻ — 1 mục"
        : "Loại: không xác định",
  ]
  if (typeof meta?.action === "string" && meta.action.trim()) {
    scopeLines.push(`Action: ${meta.action.trim()}`)
  }
  if (isBulk) {
    scopeLines.push(`IDs: ${safeJsonStringify(bulkIds)}`)
    scopeLines.push("API chuẩn kỳ vọng: POST /admin/{resource}/bulk")
  } else if (singleId) {
    scopeLines.push(`ID: ${singleId}`)
    const action = typeof meta?.action === "string" ? meta.action.trim() : ""
    const resource =
      typeof meta?.resource === "string" ? meta.resource.trim() : "{resource}"
    if (action === "delete") {
      scopeLines.push(`API chuẩn kỳ vọng: DELETE /admin/${resource}/${singleId}`)
    } else if (action === "restore") {
      scopeLines.push(
        `API chuẩn kỳ vọng: POST /admin/${resource}/${singleId}/restore`,
      )
    } else if (action === "hard-delete") {
      scopeLines.push(
        `API chuẩn kỳ vọng: DELETE /admin/${resource}/${singleId}/hard-delete`,
      )
    }
  }

  const lines = [
    `${resolveAdminOperationReportHeader()} — REALTIME SOCKET`,
    ...formatAdminOperationReportBrandingSection(),
    `Loại: ${payload.kind}`,
    `Tiêu đề: ${payload.title}`,
  ]
  if (payload.description?.trim()) {
    lines.push(`Mô tả: ${payload.description.trim()}`)
  }
  if (payload.actionUrl?.trim()) {
    lines.push(`Action URL: ${payload.actionUrl.trim()}`)
  }
  lines.push(...scopeLines)
  lines.push("", "── Payload (JSON) ──", safeJsonStringify(payload))
  lines.push(
    "",
    "Ghi chú: Toast socket từ tab/user khác hoặc activity log hệ thống.",
  )
  return lines.join("\n")
}

export type AdminOperationToastPayload = {
  /** Dòng hiển thị trên toast — kết quả ngắn gọn. */
  message: string
  /** Báo cáo copy — không render trong toast. */
  copyReport?: string
  /** Mô tả hiển thị (prod hoặc override tùy chỉnh ngắn). */
  description?: string
}

export function adminOperationToastPayloadToOptions(
  payload: AdminOperationToastPayload,
  extra?: Pick<
    ToastOptions,
    "id" | "duration" | "copyStartedAt" | "copyReportBuilder" | "copyVariant"
  >,
): ToastOptions {
  const opts: ToastOptions = { ...extra }
  if (payload.description) opts.description = payload.description
  if (payload.copyReport && !opts.copyReportBuilder) {
    opts.copyReport = payload.copyReport
  }
  return opts
}

export function buildAdminOperationSuccessToast(
  message: string,
  ctx: AdminOperationReviewContext,
  customDescription?: string,
): AdminOperationToastPayload {
  const trimmedMessage = message.trim() || "Đã thực hiện thành công"
  const custom = customDescription?.trim()
  const copyReport = adminOperationToastConfig.devFullCopyReport
    ? formatAdminOperationReviewReport(ctx)
    : undefined

  return {
    message: trimmedMessage,
    ...(custom ? { description: custom } : {}),
    ...(copyReport ? { copyReport } : {}),
  }
}

export function buildAdminOperationErrorToastPayload(
  message: string,
  ctx: AdminOperationReviewContext,
  customDescription?: string,
): AdminOperationToastPayload {
  const trimmedMessage = message.trim() || "Không thực hiện được thao tác"
  const custom = customDescription?.trim()
  const copyReport = adminOperationToastConfig.devFullCopyReport
    ? formatAdminOperationReviewReport({
        ...ctx,
        error: ctx.error,
      })
    : undefined

  return {
    message: trimmedMessage,
    ...(custom ? { description: custom } : {}),
    ...(copyReport ? { copyReport } : {}),
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
