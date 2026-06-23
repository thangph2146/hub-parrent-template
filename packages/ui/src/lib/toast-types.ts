import type { ExternalToast } from "sonner"

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
}

export function toSonnerToastOptions(
  data?: ToastOptions,
): ExternalToast | undefined {
  if (!data) return undefined
  const {
    copyReport: _copyReport,
    copyReportBuilder: _copyReportBuilder,
    copyVariant: _copyVariant,
    copyStartedAt: _copyStartedAt,
    ...rest
  } = data
  return rest
}
