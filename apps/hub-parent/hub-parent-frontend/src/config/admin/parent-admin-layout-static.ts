import type { AdminLayoutStaticConfig } from "@ui/components/admin"
import { PARENT_ADMIN_MENU_TREE } from "@/config/admin/parent-admin-menu-tree"
import {
  PARENT_ADMIN_HOME_PATH,
  PARENT_ADMIN_LOGIN_PATH,
  PARENT_ADMIN_PROFILE_PATH,
  canAccessParentAdmin,
} from "@/config/admin/parent-admin-access"
import { ADMIN_SESSION_EVENT, clearAdminSession } from "@/lib/admin/auth-session"
import { isParentAdminAuthPath } from "@/lib/admin/auth-routes"

export const PARENT_ADMIN_LAYOUT_STATIC: AdminLayoutStaticConfig = {
  menuTree: PARENT_ADMIN_MENU_TREE,
  loginPath: PARENT_ADMIN_LOGIN_PATH,
  isAuthPath: isParentAdminAuthPath,
  canAccessApp: canAccessParentAdmin,
  clearSession: clearAdminSession,
  sessionEventName: ADMIN_SESSION_EVENT,
  mobileHeaderTitle: "HUB Parent Admin",
  homePath: PARENT_ADMIN_HOME_PATH,
  profilePath: PARENT_ADMIN_PROFILE_PATH,
  publicSitePath: "/",
  publicSiteLabel: "Trang chu HUB Parent",
}

