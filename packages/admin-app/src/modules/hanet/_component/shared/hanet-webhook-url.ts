import { getApiOrigin } from "@workspace/admin-app/lib/api-base-url"

/** URL webhook chung — HANET suy sự kiện từ `deviceID` ↔ mã camera trong HUB. */
export function buildHanetWebhookAutoUrl(): string {
  return `${getApiOrigin()}/api/public/hanet/webhook`
}

/** URL webhook HANET cho một sự kiện (khuyến nghị trên developers.hanet.ai). */
export function buildHanetWebhookUrl(eventId: string): string {
  return `${getApiOrigin()}/api/public/hanet/webhook/${encodeURIComponent(eventId)}`
}
