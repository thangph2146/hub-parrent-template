import { DEFAULT_API_URL } from "../sdk"

export const ADMIN_SOCKET_PATH = "/api/socket"

/** Origin Socket.IO (không gồm path) từ base URL API. */
export function getSocketOriginFromApiBase(apiBaseUrl?: string): string {
  const api = (apiBaseUrl ?? DEFAULT_API_URL).replace(/\/$/, "")
  return api.replace(/\/api$/i, "")
}
  