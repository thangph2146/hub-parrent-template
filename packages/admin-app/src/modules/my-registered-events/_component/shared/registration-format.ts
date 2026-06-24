import { formatEventDateTime } from "./event-display"

export function formatRange(start?: string | null, end?: string | null): string {
  const parts = [formatEventDateTime(start), formatEventDateTime(end)].filter(
    Boolean,
  )
  return parts.join(" – ") || "Chưa cập nhật"
}

export const FORMAT_LABELS: Record<number, string> = {
  0: "Trực tiếp (Offline)",
  1: "Trực tuyến (Online)",
  2: "Kết hợp (Hybrid)",
}
