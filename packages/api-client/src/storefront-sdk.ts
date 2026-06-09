import type { ApiClientOptions } from "./client";
import { createStoreSyncSdk, DEFAULT_API_URL, type StoreSyncSdk } from "./sdk";

/** localStorage key dùng chung cho phiên storefront Store Sync / HUB catalog. */
export const STORE_SYNC_SESSION_STORAGE_KEY = "storesync_session";

/** Đọc `id` user từ phiên storefront (browser). */
export function readStoreSyncSessionUserId(
  storageKey = STORE_SYNC_SESSION_STORAGE_KEY,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const session = JSON.parse(raw) as { id?: string };
    return session.id ?? null;
  } catch {
    return null;
  }
}

export type CreateStorefrontSdkOptions = Omit<
  ApiClientOptions,
  "baseUrl" | "getUserId"
> & {
  baseUrl?: string;
  sessionStorageKey?: string;
};

/**
 * Factory SDK cho storefront Next (`@frontend`, `@store-sync-frontend`).
 * App chỉ cần truyền `baseUrl` (thường từ `NEXT_PUBLIC_API_URL`).
 */
export function createStorefrontSdk(
  options: CreateStorefrontSdkOptions = {},
): StoreSyncSdk {
  const {
    baseUrl = DEFAULT_API_URL,
    sessionStorageKey = STORE_SYNC_SESSION_STORAGE_KEY,
    ...rest
  } = options;

  return createStoreSyncSdk({
    baseUrl,
    getUserId: () => readStoreSyncSessionUserId(sessionStorageKey),
    ...rest,
  });
}
