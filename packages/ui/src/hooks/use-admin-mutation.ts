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
  adminApiMeta,
  inferAdminApiFromMutationKey,
  type AdminApiMeta,
  type AdminOperationToastMessages,
} from "../lib/admin-operation-toast"
import {
  adminToastSuppressMeta,
  type AdminToastSuppressMeta,
} from "../lib/admin-toast-suppress"

type AdminMutationLifecycleCallbacks<
  TData = unknown,
  TError = Error,
  TVariables = void,
> = {
  /** TanStack Query v5 không còn gọi callback trên `useMutation` — hook này tự forward. */
  onSuccess?: (
    data: TData,
    variables: TVariables,
    ...rest: unknown[]
  ) => void | Promise<void>
  onError?: (
    error: TError,
    variables: TVariables,
    ...rest: unknown[]
  ) => void | Promise<void>
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    ...rest: unknown[]
  ) => void | Promise<void>
}

export type UseAdminMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "onSuccess" | "onError" | "onSettled"
> &
  AdminMutationLifecycleCallbacks<TData, TError, TVariables> & {
    /** `false` = tắt toast; `undefined` = mặc định loading/success/error */
    toast?:
      | Partial<AdminOperationToastMessages<TData, TVariables, TError>>
      | false
    /** Chặn toast socket trùng sau khi API trả 2xx (mặc định suy từ mutationKey[0]/[1]). */
    suppressRealtime?: AdminToastSuppressMeta | false
    /** Endpoint HTTP cho báo cáo copy (dev) — mặc định suy từ mutationKey. */
    adminApi?: AdminApiMeta | false
  }

export function useAdminMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseAdminMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    toast: toastOverride,
    suppressRealtime,
    adminApi: adminApiOverride,
    meta,
    mutationKey,
    onSuccess: userOnSuccess,
    onError: userOnError,
    onSettled: userOnSettled,
    mutationFn,
    ...rest
  } = options

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

  if (adminApiOverride !== false) {
    const inferredApi =
      adminApiOverride ?? inferAdminApiFromMutationKey(mutationKey)
    if (inferredApi) {
      mergedMeta = { ...mergedMeta, ...adminApiMeta(inferredApi) }
    }
  }

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    ...rest,
    mutationKey,
    meta: mergedMeta,
    mutationFn: mutationFn!,
  })

  return {
    ...mutation,
    mutate: (variables, mutateOptions) => {
      mutation.mutate(variables, {
        ...mutateOptions,
        onSuccess: (data, vars, _ctx, mutateCtx) => {
          void userOnSuccess?.(data, vars, _ctx, mutateCtx)
          mutateOptions?.onSuccess?.(data, vars, _ctx, mutateCtx)
        },
        onError: (error, vars, _ctx, mutateCtx) => {
          void userOnError?.(error, vars, _ctx, mutateCtx)
          mutateOptions?.onError?.(error, vars, _ctx, mutateCtx)
        },
        onSettled: (data, error, vars, _ctx, mutateCtx) => {
          void userOnSettled?.(data, error, vars, _ctx, mutateCtx)
          mutateOptions?.onSettled?.(data, error, vars, _ctx, mutateCtx)
        },
      })
    },
    mutateAsync: async (variables, mutateOptions) => {
      let settledCtx: unknown
      let settledMutateCtx: unknown
      try {
        const data = await mutation.mutateAsync(variables, {
          ...mutateOptions,
          onSuccess: (result, vars, ctx, mCtx) => {
            settledCtx = ctx
            settledMutateCtx = mCtx
            mutateOptions?.onSuccess?.(result, vars, ctx, mCtx)
          },
        })
        await userOnSuccess?.(data, variables, settledCtx, settledMutateCtx)
        await userOnSettled?.(
          data,
          null,
          variables,
          settledCtx,
          settledMutateCtx
        )
        return data
      } catch (error) {
        await userOnError?.(error as TError, variables)
        await userOnSettled?.(undefined, error as TError, variables)
        throw error
      }
    },
  }
}
