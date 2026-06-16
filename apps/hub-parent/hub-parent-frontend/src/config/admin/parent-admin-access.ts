import { canAccessStaffAdmin, type AuthUser } from "@workspace/api-client"
import type { AdminAppConfig } from "@workspace/admin-app/config"
import {
  buildAdminShellPaths,
  isPathUnderAdminBase,
} from "@workspace/admin-app/config/admin-access-paths"
import adminAppConfig from "../../../admin.app.config.json"

const PARENT_ADMIN_PATHS = buildAdminShellPaths(adminAppConfig as AdminAppConfig)

export const PARENT_ADMIN_BASE_PATH = PARENT_ADMIN_PATHS.basePath
export const PARENT_ADMIN_HOME_PATH = PARENT_ADMIN_PATHS.homePath
export const PARENT_ADMIN_LOGIN_PATH = PARENT_ADMIN_PATHS.loginPath
export const PARENT_ADMIN_PROFILE_PATH = PARENT_ADMIN_PATHS.profilePath
export const PARENT_ADMIN_REGISTER_PATH = PARENT_ADMIN_PATHS.registerPath
export const PARENT_ADMIN_INDEX_PATH = PARENT_ADMIN_PATHS.indexPath

export function canAccessParentAdmin(user: AuthUser): boolean {
  return canAccessStaffAdmin(user)
}

export function isParentAdminShellPath(
  pathname: string | null | undefined,
): boolean {
  return isPathUnderAdminBase(pathname, PARENT_ADMIN_BASE_PATH)
}

