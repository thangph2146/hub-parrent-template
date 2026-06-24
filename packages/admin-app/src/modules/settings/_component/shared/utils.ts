/** Giá trị settings từ API có thể bị JSON double-encode (MikroORM type:json). */
export function extractSettingValue(res: unknown, fallback: string): string {
  if (res == null) return fallback

  const envelope = res as { data?: { value?: unknown }; value?: unknown }
  const raw = envelope.data?.value ?? envelope.value

  if (raw === "") return ""
  if (raw == null) return fallback

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === "string" ? parsed : raw
    } catch {
      return raw
    }
  }

  if (typeof raw === "number" || typeof raw === "boolean") {
    return String(raw)
  }

  return fallback
}
