import type { AdminLayoutStaticConfig } from "@ui/components/admin"
import { STORE_ADMIN_MENU_TREE } from "@/config/admin/store-admin-menu-tree"
import {
  STORE_ADMIN_HOME_PATH,
  STORE_ADMIN_LOGIN_PATH,
  STORE_ADMIN_PROFILE_PATH,
  canAccessStoreAdmin,
} from "@/config/admin/store-admin-access"
import { ADMIN_SESSION_EVENT, clearAdminSession } from "@/lib/admin/auth-session"
import { isStoreAdminAuthPath } from "@/lib/admin/auth-routes"

export const STORE_ADMIN_LAYOUT_STATIC: AdminLayoutStaticConfig = {
  menuTree: STORE_ADMIN_MENU_TREE,
  loginPath: STORE_ADMIN_LOGIN_PATH,
  isAuthPath: isStoreAdminAuthPath,
  canAccessApp: canAccessStoreAdmin,
  clearSession: clearAdminSession,
  sessionEventName: ADMIN_SESSION_EVENT,
  mobileHeaderTitle: "StoreSync Admin",
  homePath: STORE_ADMIN_HOME_PATH,
  profilePath: STORE_ADMIN_PROFILE_PATH,
  publicSitePath: "/",
  publicSiteLabel: "Trang chủ B2B",
}
