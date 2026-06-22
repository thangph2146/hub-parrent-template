import type { ExternalToast } from "sonner"

/** Tuỳ chọn toast HUB — `copyReport` chỉ dùng cho nút Sao chép, không hiển thị UI. */
export type HubToastOptions = ExternalToast & {
  copyReport?: string
}

export function toSonnerToastOptions(
  data?: HubToastOptions,
): ExternalToast | undefined {
  if (!data) return undefined
  const { copyReport: _copyReport, ...rest } = data
  return rest
}
