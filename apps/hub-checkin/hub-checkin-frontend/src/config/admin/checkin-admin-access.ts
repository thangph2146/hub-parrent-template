import {

  canUserAccess,

  CHECKIN_ADMIN_ENTRY_PERMISSION_CODES,

  PERMISSION_CODES,

  type AuthUser,

  type PermissionCode,

} from "@workspace/api-client"

import type { AdminAppConfig } from "@workspace/admin-app/config"

import { buildAdminShellPaths, isPathUnderAdminBase } from "@workspace/admin-app/config/admin-access-paths"

import adminAppConfig from "../../../config/admin.app.config.json"



const CHECKIN_ADMIN_PATHS = buildAdminShellPaths(adminAppConfig as AdminAppConfig)



/** Prefix route admin — đọc từ `admin.app.config.json` (`basePath`). */

export const CHECKIN_ADMIN_BASE_PATH = CHECKIN_ADMIN_PATHS.basePath

export const CHECKIN_ADMIN_HOME_PATH = CHECKIN_ADMIN_PATHS.homePath

export const CHECKIN_ADMIN_LOGIN_PATH = CHECKIN_ADMIN_PATHS.loginPath

export const CHECKIN_ADMIN_PROFILE_PATH = CHECKIN_ADMIN_PATHS.profilePath

export const CHECKIN_ADMIN_REGISTER_PATH = CHECKIN_ADMIN_PATHS.registerPath

export const CHECKIN_ADMIN_INDEX_PATH = CHECKIN_ADMIN_PATHS.indexPath



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



export function isCheckinAdminShellPath(pathname: string | null | undefined): boolean {

  return isPathUnderAdminBase(pathname, CHECKIN_ADMIN_BASE_PATH)

}

