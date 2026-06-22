"use client"

import {
  MutationCache,
  type Mutation,
  type MutationKey,
} from "@tanstack/react-query"
import { toast } from "./hub-toast"
import { suppressRealtimeToastAfterMutation } from "./admin-toast-suppress"
import { resolveAdminOperationError } from "./admin-operation-error"
import {
  adminOperationToastPayloadToOptions,
  buildAdminApiCallFromMeta,
  buildAdminOperationErrorToastPayload,
  buildAdminOperationSuccessToast,
  inferAdminApiFromMutationKey,
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
  adminOperationToastConfig,
  buildAdminOperationErrorToast,
  buildAdminOperationErrorToastPayload,
  buildAdminOperationSuccessToast,
  formatAdminOperationReviewReport,
  adminOperationToastPayloadToOptions,
  adminApiMeta,
  inferAdminApiFromMutationKey,
  type AdminApiMeta,
  type AdminOperationReviewContext,
  type AdminOperationToastPayload,
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
export const defaultBulkOperationToast: AdminOperationToastMessages<
  unknown,
  { action: string; ids: string[] }
> = {
  loading: "Đang xử lý hàng loạt…",
  success: (_data, variables) => {
    const count = variables.ids?.length ?? 0
    if (variables.action === "delete") {
      return `Đã đưa ${count} mục vào thùng rác`
    }
    if (variables.action === "restore") {
      return `Đã khôi phục ${count} mục`
    }
    return `Đã xóa vĩnh viễn ${count} mục`
  },
  error: (err) => resolveAdminOperationError(err),
}

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
  adminToast?: AdminOperationToastMessages<unknown, unknown, unknown>
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
  return getAdminMutationMeta(mutation)?.adminToast
}

export function createAdminMutationCache(): MutationCache {
  return new MutationCache({
    onMutate: (_variables, mutation) => {
      if (getAdminToastMeta(mutation)) {
        mutationStartedAt.set(mutation, Date.now())
      }
      const adminToast = getAdminToastMeta(mutation)
      if (!adminToast?.loading) return
      const id = toast.loading(adminToast.loading)
      toastIds.set(mutation, id)
    },
    onSuccess: (data, variables, _context, mutation) => {
      const adminToast = getAdminToastMeta(mutation)
      if (!adminToast) return
      const id = toastIds.get(mutation)
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
      const toastOptions = adminOperationToastPayloadToOptions(
        payload,
        id != null ? { id } : undefined
      )
      toast.success(payload.message, toastOptions)
      toastIds.delete(mutation)
      mutationStartedAt.delete(mutation)
      const meta = getAdminMutationMeta(mutation)
      suppressRealtimeToastAfterMutation(
        mutation.options.mutationKey,
        meta?.adminToastSuppress,
        data,
        variables
      )
    },
    onError: (error, variables, _context, mutation) => {
      const adminToast = getAdminToastMeta(mutation)
      if (!adminToast) return
      const id = toastIds.get(mutation)
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
      const toastOptions = adminOperationToastPayloadToOptions(
        payload,
        id != null ? { id } : undefined
      )
      toast.error(payload.message, toastOptions)
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
  extra?: { id?: string | number; duration?: number }
): string | number {
  const payload = buildAdminOperationSuccessToast(
    message,
    ctx,
    customDescription
  )
  return toast.success(
    payload.message,
    adminOperationToastPayloadToOptions(payload, extra)
  )
}

export function showAdminOperationErrorToast(
  message: string,
  ctx: AdminOperationReviewContext,
  customDescription?: string,
  extra?: { id?: string | number; duration?: number }
): string | number {
  const payload = buildAdminOperationErrorToastPayload(
    message,
    ctx,
    customDescription
  )
  return toast.error(
    payload.message,
    adminOperationToastPayloadToOptions(payload, extra)
  )
}
