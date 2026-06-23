import type { ToastOptions } from "@ui/components/sonner"
import { buildManualOperationToastOptions } from "@ui/lib/admin-operation-toast"

/** Toast storage — loading + kết quả với báo cáo Sao chép đầy đủ. */
export function storageOperationToastOptions(input: {
  startedAt: number
  operationLabel: string
  variables?: unknown
  data?: unknown
  error?: unknown
  adminApi?: { method: string; path: string }
  extra?: Pick<ToastOptions, "id" | "duration" | "description">
}): ToastOptions {
  return buildManualOperationToastOptions({
    startedAt: input.startedAt,
    operationLabel: input.operationLabel,
    variables: input.variables,
    data: input.data,
    error: input.error,
    adminApi: input.adminApi,
    storageOperation: true,
    extra: input.extra,
  })
}
