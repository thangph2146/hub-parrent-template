/** Chuẩn hóa id từ Socket / metadata — API có thể gửi number hoặc string. */
export function normalizeSocketId(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }
  return undefined
}
