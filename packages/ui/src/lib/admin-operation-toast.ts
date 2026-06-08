"use client"

import {
  MutationCache,
  type Mutation,
  type MutationKey,
} from "@tanstack/react-query"
import { toast } from "./hub-toast"
import { suppressRealtimeToastAfterMutation } from "./admin-toast-suppress"

export type AdminOperationToastMessages<
  TData = unknown,
  TVariables = unknown,
  TError = unknown,
> = {
  loading: string
  success: string | ((data: TData, variables: TVariables) => string)
  error?: string | ((err: TError, variables: TVariables) => string)
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

function resolveMessage(
  message: string | ((...args: never[]) => string),
  ...args: unknown[]
): string {
  return typeof message === "function"
    ? (message as (...a: unknown[]) => string)(...args)
    : message
}

export function resolveAdminOperationError(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message: unknown }).message
    if (typeof message === "string" && message.trim()) return message.trim()
  }
  return "Không thực hiện được thao tác"
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
      if (id != null) {
        toast.success(message, { id })
      } else {
        toast.success(message)
      }
      toastIds.delete(mutation)
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
      const message = adminToast.error
        ? resolveMessage(adminToast.error, error, variables)
        : resolveAdminOperationError(error)
      if (id != null) {
        toast.error(message, { id })
      } else {
        toast.error(message)
      }
      toastIds.delete(mutation)
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
