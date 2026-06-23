"use client"

import {
  MutationCache,
  type Mutation,
  type MutationKey,
} from "@tanstack/react-query"
import { toast } from "./toast"
import type { ToastOptions } from "./toast-types"
import { TOAST_COPY_HINT_DONE, TOAST_COPY_HINT_ERROR, TOAST_COPY_HINT_LOADING } from "./toast-types"
import { suppressRealtimeToastAfterMutation } from "./admin-toast-suppress"
import { resolveAdminOperationError } from "./admin-operation-error"
import {
  adminOperationToastConfig,
  adminOperationToastPayloadToOptions,
  buildAdminApiCallFromMeta,
  buildAdminOperationErrorToastPayload,
  buildAdminOperationSuccessToast,
  formatAdminOperationReviewReport,
  formatStorageOperationCopyReport,
  inferAdminApiFromMutationKey,
  resolveBulkOperationToastMessage,
  type AdminOperationReviewContext,
} from "./admin-operation-toast-config"
import {
  getAdminApiCallsSince,
  getLastAdminApiCall,
  type AdminApiCallRecord,
} from "@workspace/api-client"

export {
  resolveAdminOperationError,
  formatAdminOperationErrorDetails,
} from "./admin-operation-error"
export {
  syncAdminOperationReportBranding,
  resolveAdminOperationReportHeader,
  resolveAdminPortalLabel,
} from "./admin-operation-report-branding"
export {
  adminOperationToastConfig,
  buildAdminOperationErrorToast,
  buildAdminOperationErrorToastPayload,
  buildAdminOperationSuccessToast,
  formatAdminOperationReviewReport,
  formatStorageOperationCopyReport,
  formatRealtimeNotificationCopyReport,
  adminOperationToastPayloadToOptions,
  adminApiMeta,
  inferAdminApiFromMutationKey,
  resolveBulkOperationToastMessage,
  type AdminApiMeta,
  type AdminOperationReviewContext,
  type AdminOperationToastPayload,
  type StorageOperationCopyReportInput,
} from "./admin-operation-toast-config"

export type AdminOperationToastMessages<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
> = {
  loading: string
  success: string | ((data: TData, variables: TVariables) => string)
  successDescription?:
    | string
    | ((data: TData, variables: TVariables) => string | undefined)
  error?: string | ((err: TError, variables: TVariables) => string)
  errorDescription?:
    | string
    | ((err: TError, variables: TVariables) => string | undefined)
}

export const defaultAdminOperationToast: AdminOperationToastMessages = {
  loading: "Đang thực hiện…",
  success: "Đã thực hiện thành công",
  error: (err) => resolveAdminOperationError(err),
}

/** Toast mặc định cho bulk delete / restore / hard-delete. */
export function createBulkOperationToast(
  unitLabel = "mục",
): AdminOperationToastMessages<
  unknown,
  { action: string; ids: string[] }
> {
  return {
    loading: "Bulk: Đang xử lý hàng loạt…",
    success: (_data, variables) =>
      resolveBulkOperationToastMessage(variables, unitLabel),
    error: (err) => resolveAdminOperationError(err),
  }
}

export const defaultBulkOperationToast = createBulkOperationToast()

const toastIds = new WeakMap<
  Mutation<unknown, unknown, unknown, unknown>,
  string | number
>()

const mutationStartedAt = new WeakMap<
  Mutation<unknown, unknown, unknown, unknown>,
  number
>()

function collectApiCallsForMutation(
  mutation: Mutation<unknown, unknown, unknown, unknown>,
  partial: Pick<AdminOperationReviewContext, "variables" | "data" | "error">,
): AdminApiCallRecord[] {
  const since = mutationStartedAt.get(mutation)
  const traced = since != null ? getAdminApiCallsSince(since) : []
  if (traced.length > 0) return traced

  const last = getLastAdminApiCall()
  if (last && since != null && last.completedAt >= since - 50) {
    return [last]
  }

  const meta = getAdminMutationMeta(mutation)
  const adminApi =
    meta?.adminApi ??
    inferAdminApiFromMutationKey(mutation.options.mutationKey, partial.variables)
  if (adminApi) {
    return [
      buildAdminApiCallFromMeta(adminApi, {
        variables: partial.variables,
        data: partial.data,
        error: partial.error,
      }),
    ]
  }

  return []
}

function buildReviewContext(
  mutation: Mutation<unknown, unknown, unknown, unknown>,
  partial: Omit<AdminOperationReviewContext, "mutationKey" | "apiCalls">,
): AdminOperationReviewContext {
  return {
    mutationKey: mutation.options.mutationKey,
    apiCalls: collectApiCallsForMutation(mutation, partial),
    adminApi: getAdminMutationMeta(mutation)?.adminApi,
    ...partial,
  }
}

function resolveMessage(
  message: string | ((...args: never[]) => string),
  ...args: unknown[]
): string {
  return typeof message === "function"
    ? (message as (...a: unknown[]) => string)(...args)
    : message
}

function resolveOptionalMessage(
  message: string | ((...args: never[]) => string | undefined) | undefined,
  ...args: unknown[]
): string | undefined {
  if (!message) return undefined
  const resolved =
    typeof message === "function"
      ? (message as (...a: unknown[]) => string | undefined)(...args)
      : message
  const trimmed = resolved?.trim()
  return trimmed || undefined
}

export function adminToastMeta<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
>(
  messages: AdminOperationToastMessages<TData, TVariables, TError>
): { adminToast: AdminOperationToastMessages<TData, TVariables, TError> } {
  return { adminToast: messages }
}

type AdminMutationMeta = {
  adminToast?: AdminOperationToastMessages<unknown, unknown, unknown> | false
  adminToastSuppress?: { resource?: string; action?: string }
  adminApi?: import("./admin-operation-toast-config").AdminApiMeta
}

function getAdminMutationMeta(
  mutation: Mutation<unknown, unknown, unknown, unknown>
): AdminMutationMeta | undefined {
  return mutation.meta as AdminMutationMeta | undefined
}

function getAdminToastMeta(
  mutation: Mutation<unknown, unknown, unknown, unknown>
): AdminOperationToastMessages | undefined {
  const meta = getAdminMutationMeta(mutation)
  if (meta?.adminToast === false) return undefined
  if (meta?.adminToast) return meta.adminToast
  const inferred = inferAdminToastFromMutationKey(mutation.options.mutationKey)
  if (!inferred) return undefined
  return {
    ...defaultAdminOperationToast,
    ...inferred,
    loading:
      inferred.loading ?? defaultAdminOperationToast.loading,
    success:
      inferred.success ?? defaultAdminOperationToast.success,
    error: inferred.error ?? defaultAdminOperationToast.error,
  }
}

/** Tuỳ chọn toast cho thao tác thủ công (storage, import, …) — loading + kết quả copy đầy đủ. */
export function buildManualOperationToastOptions(input: {
  startedAt: number
  operationLabel: string
  variables?: unknown
  data?: unknown
  error?: unknown
  adminApi?: import("./admin-operation-toast-config").AdminApiMeta
  storageOperation?: boolean
  extra?: Pick<ToastOptions, "id" | "duration" | "description">
}): ToastOptions {
  const reportInput = {
    operationLabel: input.operationLabel,
    variables: input.variables,
    data: input.data,
    error: input.error,
    adminApi: input.adminApi,
  }
  return {
    copyStartedAt: input.startedAt,
    copyContext: {
      operationLabel: input.operationLabel,
      variables: input.variables,
      data: input.data,
      error: input.error,
      adminApi: input.adminApi,
      storageOperation: input.storageOperation,
    },
    copyReportBuilder: buildOperationCopyReportBuilderFromInput(reportInput, {
      storageOperation: input.storageOperation,
      startedAt: input.startedAt,
    }),
    description: input.extra?.description ?? TOAST_COPY_HINT_LOADING,
    ...input.extra,
  }
}

function buildOperationCopyReportBuilderFromInput(
  partial: Omit<AdminOperationReviewContext, "mutationKey" | "apiCalls"> & {
    operationLabel: string
  },
  options?: { storageOperation?: boolean; startedAt: number },
): (() => string) | undefined {
  if (!adminOperationToastConfig.devFullCopyReport) return undefined
  return () => {
    const apiCalls = getAdminApiCallsSince(options?.startedAt)
    if (options?.storageOperation) {
      const adminApi =
        partial.adminApi &&
        typeof partial.adminApi.path === "string"
          ? { method: partial.adminApi.method, path: partial.adminApi.path }
          : undefined
      return formatStorageOperationCopyReport({
        operationLabel: partial.operationLabel,
        variables: partial.variables,
        data: partial.data,
        error: partial.error,
        adminApi,
        apiCalls,
      })
    }
    return formatAdminOperationReviewReport({
      ...partial,
      apiCalls,
    })
  }
}

function buildOperationCopyReportBuilder(
  mutation: Mutation<unknown, unknown, unknown, unknown>,
  partial: Omit<
    AdminOperationReviewContext,
    "mutationKey" | "apiCalls" | "adminApi"
  >,
): (() => string) | undefined {
  if (!adminOperationToastConfig.devFullCopyReport) return undefined
  return () =>
    formatAdminOperationReviewReport(buildReviewContext(mutation, partial))
}

export function createAdminMutationCache(): MutationCache {
  return new MutationCache({
    onMutate: (variables, mutation) => {
      const adminToast = getAdminToastMeta(mutation)
      const startedAt = Date.now()
      if (adminToast) {
        mutationStartedAt.set(mutation, startedAt)
      }
      if (!adminToast?.loading) return
      const id = toast.loading(adminToast.loading, {
        copyStartedAt: startedAt,
        copyVariant: "loading",
        description: TOAST_COPY_HINT_LOADING,
        duration: Number.POSITIVE_INFINITY,
        copyReportBuilder: buildOperationCopyReportBuilder(mutation, {
          variables,
        }),
      })
      toastIds.set(mutation, id)
    },
    onSuccess: (data, variables, _context, mutation) => {
      const adminToast = getAdminToastMeta(mutation)
      if (!adminToast) return
      const id = toastIds.get(mutation)
      const startedAt = mutationStartedAt.get(mutation)
      const message = resolveMessage(adminToast.success, data, variables)
      const customDescription = resolveOptionalMessage(
        adminToast.successDescription,
        data,
        variables
      )
      const payload = buildAdminOperationSuccessToast(
        message,
        buildReviewContext(mutation, { variables, data }),
        customDescription
      )
      const toastOptions = adminOperationToastPayloadToOptions(payload, {
        ...(id != null ? { id } : {}),
        ...(startedAt != null ? { copyStartedAt: startedAt } : {}),
        copyReportBuilder: buildOperationCopyReportBuilder(mutation, {
          variables,
          data,
        }),
      })
      const meta = getAdminMutationMeta(mutation)
      suppressRealtimeToastAfterMutation(
        mutation.options.mutationKey,
        meta?.adminToastSuppress,
        data,
        variables
      )
      toast.success(payload.message, {
        ...toastOptions,
        description: toastOptions.description ?? TOAST_COPY_HINT_DONE,
        duration: toastOptions.duration ?? 6000,
      })
      toastIds.delete(mutation)
      mutationStartedAt.delete(mutation)
    },
    onError: (error, variables, _context, mutation) => {
      const adminToast = getAdminToastMeta(mutation)
      if (!adminToast) return
      const id = toastIds.get(mutation)
      const startedAt = mutationStartedAt.get(mutation)
      const title = adminToast.error
        ? resolveMessage(adminToast.error, error, variables)
        : resolveAdminOperationError(error)
      const customDescription = resolveOptionalMessage(
        adminToast.errorDescription,
        error,
        variables
      )
      const payload = buildAdminOperationErrorToastPayload(
        title,
        buildReviewContext(mutation, { variables, error }),
        customDescription
      )
      const toastOptions = adminOperationToastPayloadToOptions(payload, {
        ...(id != null ? { id } : {}),
        ...(startedAt != null ? { copyStartedAt: startedAt } : {}),
        copyReportBuilder: buildOperationCopyReportBuilder(mutation, {
          variables,
          error,
        }),
      })
      const meta = getAdminMutationMeta(mutation)
      suppressRealtimeToastAfterMutation(
        mutation.options.mutationKey,
        meta?.adminToastSuppress,
        undefined,
        variables
      )
      toast.error(payload.message, {
        ...toastOptions,
        description: toastOptions.description ?? TOAST_COPY_HINT_ERROR,
        duration: toastOptions.duration ?? 8000,
      })
      toastIds.delete(mutation)
      mutationStartedAt.delete(mutation)
    },
  })
}

/** Gợi ý toast theo mutationKey (tùy chọn). */
export function inferAdminToastFromMutationKey(
  key: MutationKey | undefined
): Partial<AdminOperationToastMessages> | undefined {
  if (!key || !Array.isArray(key) || key.length === 0) return undefined
  const action = String(key[1] ?? "mutate")
  if (action === "bulk") {
    return createBulkOperationToast() as Partial<AdminOperationToastMessages>
  }
  const labels: Record<string, string> = {
    create: "tạo",
    update: "cập nhật",
    delete: "xóa",
    restore: "khôi phục",
    review: "duyệt",
    approve: "duyệt",
    reject: "từ chối",
  }
  const verb = labels[action] ?? "thực hiện"
  return {
    loading: `Đang ${verb}…`,
    success: `Đã ${verb} thành công`,
    error: (err) => `Lỗi ${verb}: ${resolveAdminOperationError(err)}`,
  }
}

/** Toast thủ công (không qua mutation cache) — cùng cấu hình dev/prod. */
export function showAdminOperationSuccessToast(
  message: string,
  ctx: AdminOperationReviewContext,
  customDescription?: string,
  extra?: { id?: string | number; duration?: number; copyStartedAt?: number }
): string | number {
  const payload = buildAdminOperationSuccessToast(
    message,
    ctx,
    customDescription
  )
  return toast.success(
    payload.message,
    adminOperationToastPayloadToOptions(payload, {
      ...extra,
      duration: extra?.duration ?? 6000,
      copyReportBuilder: adminOperationToastConfig.devFullCopyReport
        ? () => formatAdminOperationReviewReport(ctx)
        : undefined,
    })
  )
}

export function showAdminOperationErrorToast(
  message: string,
  ctx: AdminOperationReviewContext,
  customDescription?: string,
  extra?: { id?: string | number; duration?: number; copyStartedAt?: number }
): string | number {
  const payload = buildAdminOperationErrorToastPayload(
    message,
    ctx,
    customDescription
  )
  return toast.error(
    payload.message,
    adminOperationToastPayloadToOptions(payload, {
      ...extra,
      duration: extra?.duration ?? 8000,
      copyReportBuilder: adminOperationToastConfig.devFullCopyReport
        ? () => formatAdminOperationReviewReport(ctx)
        : undefined,
    })
  )
}
