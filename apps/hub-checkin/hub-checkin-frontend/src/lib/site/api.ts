import { createStoreSyncSdk, DEFAULT_API_URL } from "@workspace/api-client";
import { readEventSession } from "../portal/event-session";

function resolveSessionUserId(): string | null {
  const raw = readEventSession()?.id;
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n <= 0 || String(n) !== trimmed) return null;
  return trimmed;
}

/**
 * SDK check-in — gọi `@api` qua `@workspace/api-client`, không `fetch` trực tiếp.
 */
export const api = createStoreSyncSdk({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  getUserId: () => resolveSessionUserId(),
  devLogTag: "HUB_CHECKIN",
});

export { ApiError } from "@workspace/api-client";
