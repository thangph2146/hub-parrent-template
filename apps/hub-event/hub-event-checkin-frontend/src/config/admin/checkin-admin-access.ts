import {
  canUserAccess,
  CHECKIN_ADMIN_ENTRY_PERMISSION_CODES,
  PERMISSION_CODES,
  type AuthUser,
  type PermissionCode,
} from "@workspace/api-client"

/** URL cổng quản trị check-in (kế thừa pattern backend, base path riêng). */
export const CHECKIN_ADMIN_BASE_PATH = "/admin"
export const CHECKIN_ADMIN_HOME_PATH = `${CHECKIN_ADMIN_BASE_PATH}/tong-quan`
export const CHECKIN_ADMIN_LOGIN_PATH = `${CHECKIN_ADMIN_BASE_PATH}/dang-nhap`
export const CHECKIN_ADMIN_PROFILE_PATH = `${CHECKIN_ADMIN_BASE_PATH}/profile`

/**
 * Quyền tối thiểu để vào shell admin check-in (OR bất kỳ mã trong mẫu `event_staff`).
 * Mirror: `EVENT_CHECKIN_STAFF_PERMISSION_CODES` (`@workspace/api-client`).
 */
export const CHECKIN_ADMIN_ENTRY_PERMISSIONS: PermissionCode[] = [
  ...CHECKIN_ADMIN_ENTRY_PERMISSION_CODES,
]

export function hasAnyCheckinAdminPermission(user: AuthUser): boolean {
  return CHECKIN_ADMIN_ENTRY_PERMISSIONS.some((code) =>
    canUserAccess(user, code),
  )
}

/** Cổng đăng nhập / layout — permission chuẩn `events:*`, không chỉ role cứng. */
export function canAccessCheckinAdmin(user: AuthUser): boolean {
  return hasAnyCheckinAdminPermission(user)
}

export function canManageCheckinEvents(user: AuthUser): boolean {
  return (
    canUserAccess(user, PERMISSION_CODES.EVENTS_MANAGE) ||
    canUserAccess(user, PERMISSION_CODES.EVENTS_CREATE) ||
    canUserAccess(user, PERMISSION_CODES.EVENTS_UPDATE)
  )
}
