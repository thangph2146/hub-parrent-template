import {

  canUserAccess,

  PERMISSION_CODES,

  type AuthUser,

  type PermissionCode,

} from "@workspace/api-client"

import type { AdminAppConfig } from "@workspace/admin-app/config"

import { buildAdminShellPaths, isPathUnderAdminBase } from "@workspace/admin-app/config/admin-access-paths"

import adminAppConfig from "../../../admin.app.config.json"



const STORE_ADMIN_PATHS = buildAdminShellPaths(adminAppConfig as AdminAppConfig)



/** Prefix route admin — đọc từ `admin.app.config.json` (`basePath`). */

export const STORE_ADMIN_BASE_PATH = STORE_ADMIN_PATHS.basePath

export const STORE_ADMIN_HOME_PATH = STORE_ADMIN_PATHS.homePath

export const STORE_ADMIN_LOGIN_PATH = STORE_ADMIN_PATHS.loginPath

export const STORE_ADMIN_PROFILE_PATH = STORE_ADMIN_PATHS.profilePath

export const STORE_ADMIN_REGISTER_PATH = STORE_ADMIN_PATHS.registerPath

export const STORE_ADMIN_INDEX_PATH = STORE_ADMIN_PATHS.indexPath



/** Quyền tối thiểu để vào cổng quản trị store. */

export const STORE_ADMIN_ENTRY_PERMISSIONS: PermissionCode[] = [

  PERMISSION_CODES.DASHBOARD_VIEW,

  PERMISSION_CODES.USERS_VIEW,

  PERMISSION_CODES.USERS_MANAGE,

  PERMISSION_CODES.ROLES_VIEW,

  PERMISSION_CODES.PRODUCTS_VIEW,

  PERMISSION_CODES.PRODUCTS_MANAGE,

  PERMISSION_CODES.ORDERS_VIEW,

  PERMISSION_CODES.ORDERS_MANAGE,

  PERMISSION_CODES.SETTINGS_VIEW,

]



export function hasAnyStoreAdminPermission(user: AuthUser): boolean {

  return STORE_ADMIN_ENTRY_PERMISSIONS.some((code) => canUserAccess(user, code))

}



export function canAccessStoreAdmin(user: AuthUser): boolean {

  return hasAnyStoreAdminPermission(user)

}



export function isStoreAdminShellPath(pathname: string | null | undefined): boolean {

  return isPathUnderAdminBase(pathname, STORE_ADMIN_BASE_PATH)

}

