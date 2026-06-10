import { createStoreSyncSdk, DEFAULT_API_URL } from "@workspace/api-client";
import { readEventSession } from "./event-session";

/**
 * SDK check-in — gọi `@api` qua `@workspace/api-client`, không `fetch` trực tiếp.
 */
export const api = createStoreSyncSdk({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  getUserId: () => readEventSession()?.id ?? null,
  devLogTag: "HUB_CHECKIN",
});

export { ApiError } from "@workspace/api-client";
