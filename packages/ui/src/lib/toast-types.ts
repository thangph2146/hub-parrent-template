import type { MutationKey } from "@tanstack/react-query"
import type { ExternalToast } from "sonner"

/** Ngữ cảnh báo cáo copy — dùng cho thao tác thủ công (không qua mutation cache). */
export type ToastCopyContext = {
  operationLabel?: string
  variables?: unknown
  data?: unknown
  error?: unknown
  mutationKey?: MutationKey
  adminApi?: { method: string; path: string | ((variables: unknown) => string) }
  /** Báo cáo file storage — không dùng heuristics CRUD bulk. */
  storageOperation?: boolean
}

export type ToastVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading"
  | "default"

/** Tuỳ chọn toast — `copyReport` chỉ dùng cho nút Sao chép, không hiển thị UI. */
export type ToastOptions = ExternalToast & {
  copyReport?: string
  /** Sinh báo cáo khi bấm Sao chép — ưu tiên hơn `copyReport` tĩnh. */
  copyReportBuilder?: () => string
  /** Ghi đè loại toast trong báo cáo fallback (khi không có copyReport). */
  copyVariant?: ToastVariant
  /** Mốc bắt đầu thao tác — dùng tính thời lượng đến lúc sao chép báo cáo. */
  copyStartedAt?: number
  /** Dữ liệu bổ sung cho báo cáo copy tự động (API trace + kết quả). */
  copyContext?: ToastCopyContext
}

export const TOAST_COPY_HINT_LOADING =
  "Bấm Sao chép để lấy báo cáo thao tác (API đang chạy)."
export const TOAST_COPY_HINT_DONE =
  "Bấm Sao chép để lấy báo cáo thao tác đầy đủ."
export const TOAST_COPY_HINT_ERROR =
  "Bấm Sao chép để lấy báo cáo lỗi đầy đủ."

export function toSonnerToastOptions(
  data?: ToastOptions,
): ExternalToast | undefined {
  if (!data) return undefined
  const {
    copyReport: _copyReport,
    copyReportBuilder: _copyReportBuilder,
    copyVariant: _copyVariant,
    copyStartedAt: _copyStartedAt,
    copyContext: _copyContext,
    ...rest
  } = data
  return rest
}
