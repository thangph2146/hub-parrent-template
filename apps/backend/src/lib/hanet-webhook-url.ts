import { DEFAULT_API_URL } from "@workspace/api-client"

/** Gốc API không có suffix `/api`. */
export function getApiOrigin(): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/$/,
    "",
  )
  return base.replace(/\/api$/i, "")
}

/** URL webhook HANET cho một sự kiện (cấu hình trên developers.hanet.ai). */
export function buildHanetWebhookUrl(eventId: string): string {
  const origin = getApiOrigin()
  return `${origin}/api/public/hanet/webhook/${encodeURIComponent(eventId)}`
}
