export const HANET_ADMIN_PLACE_STORAGE_KEY = "hanet-admin-selected-place-id"

export function readHanetAdminPlaceId(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(HANET_ADMIN_PLACE_STORAGE_KEY)?.trim() ?? ""
  } catch {
    return ""
  }
}
