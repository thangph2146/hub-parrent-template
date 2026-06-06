"use client"

import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query"
import {
  adminToastMeta,
  defaultAdminOperationToast,
  inferAdminToastFromMutationKey,
  type AdminOperationToastMessages,
} from "../lib/admin-operation-toast"
import {
  adminToastSuppressMeta,
  type AdminToastSuppressMeta,
} from "../lib/admin-toast-suppress"

export type UseAdminMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationOptions<TData, TError, TVariables, TContext> & {
  /** `false` = tắt toast; `undefined` = mặc định loading/success/error */
  toast?: Partial<AdminOperationToastMessages<TData, TVariables, TError>> | false
  /** Chặn toast socket trùng sau khi API trả 2xx (mặc định suy từ mutationKey[0]/[1]). */
  suppressRealtime?: AdminToastSuppressMeta | false
}

export function useAdminMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseAdminMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { toast: toastOverride, suppressRealtime, meta, mutationKey, ...rest } =
    options

  let mergedMeta = meta

  if (suppressRealtime !== false) {
    const resource =
      suppressRealtime?.resource ??
      (Array.isArray(mutationKey) && mutationKey[0]
        ? String(mutationKey[0])
        : undefined)
    const action =
      suppressRealtime?.action ??
      (Array.isArray(mutationKey) && mutationKey[1]
        ? String(mutationKey[1])
        : undefined)
    if (resource) {
      mergedMeta = {
        ...mergedMeta,
        ...adminToastSuppressMeta({ resource, action }),
      }
    }
  }

  if (toastOverride !== false) {
    const inferred = inferAdminToastFromMutationKey(mutationKey)
    const messages: AdminOperationToastMessages<TData, TVariables, TError> = {
      ...defaultAdminOperationToast,
      ...inferred,
      ...toastOverride,
      loading:
        toastOverride?.loading ??
        inferred?.loading ??
        defaultAdminOperationToast.loading,
      success:
        toastOverride?.success ??
        inferred?.success ??
        defaultAdminOperationToast.success,
      error:
        toastOverride?.error ??
        inferred?.error ??
        defaultAdminOperationToast.error,
    }
    mergedMeta = { ...meta, ...adminToastMeta(messages) }
  }

  return useMutation<TData, TError, TVariables, TContext>({
    ...rest,
    mutationKey,
    meta: mergedMeta,
  })
}
