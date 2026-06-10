import {
  canUserAccess,
  PERMISSION_CODES,
  type AuthUser,
  type PermissionCode,
} from "@workspace/api-client"

/** URL cổng quản trị check-in (kế thừa pattern backend, base path riêng). */
export const CHECKIN_ADMIN_BASE_PATH = "/admin-checkin-su-kien"
export const CHECKIN_ADMIN_HOME_PATH = `${CHECKIN_ADMIN_BASE_PATH}/tong-quan`
export const CHECKIN_ADMIN_LOGIN_PATH = `${CHECKIN_ADMIN_BASE_PATH}/dang-nhap`

/** Quyền tối thiểu để vào shell admin check-in (bất kỳ module nào trong menu). */
export const CHECKIN_ADMIN_ENTRY_PERMISSIONS: PermissionCode[] = [
  PERMISSION_CODES.EVENTS_VIEW,
  PERMISSION_CODES.EVENTS_MANAGE,
  PERMISSION_CODES.EVENTS_CREATE,
  PERMISSION_CODES.EVENTS_UPDATE,
  PERMISSION_CODES.CATEGORIES_VIEW,
  PERMISSION_CODES.CATEGORIES_CREATE,
  PERMISSION_CODES.TAGS_VIEW,
  PERMISSION_CODES.TAGS_MANAGE,
  PERMISSION_CODES.PAGE_CONTENTS_VIEW,
  PERMISSION_CODES.POSTS_VIEW,
  PERMISSION_CODES.CAMERAS_VIEW,
  PERMISSION_CODES.CAMERAS_MANAGE,
  PERMISSION_CODES.TEMPLATES_VIEW,
  PERMISSION_CODES.TEMPLATES_MANAGE,
  PERMISSION_CODES.SCREENS_VIEW,
  PERMISSION_CODES.SCREENS_MANAGE,
  PERMISSION_CODES.LOCATIONS_VIEW,
  PERMISSION_CODES.LOCATIONS_MANAGE,
  PERMISSION_CODES.SPEAKERS_VIEW,
  PERMISSION_CODES.SPEAKERS_MANAGE,
  PERMISSION_CODES.SETTINGS_MANAGE,
  PERMISSION_CODES.SEO_METAS_VIEW,
  PERMISSION_CODES.SEO_METAS_MANAGE,
  PERMISSION_CODES.UPLOADS_VIEW,
  PERMISSION_CODES.UPLOADS_MANAGE,
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
