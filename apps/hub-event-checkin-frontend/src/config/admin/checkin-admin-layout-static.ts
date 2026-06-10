import type { AdminLayoutStaticConfig } from "@ui/components/admin"
import { CHECKIN_ADMIN_MENU_TREE } from "@/config/admin/checkin-admin-menu-tree"
import {
  CHECKIN_ADMIN_HOME_PATH,
  CHECKIN_ADMIN_LOGIN_PATH,
  canAccessCheckinAdmin,
} from "@/config/admin/checkin-admin-access"
import { ADMIN_SESSION_EVENT, clearAdminSession } from "@/lib/admin/auth-session"
import { isCheckinAdminAuthPath } from "@/lib/admin/auth-routes"

export const CHECKIN_ADMIN_LAYOUT_STATIC: AdminLayoutStaticConfig = {
  menuTree: CHECKIN_ADMIN_MENU_TREE,
  loginPath: CHECKIN_ADMIN_LOGIN_PATH,
  isAuthPath: isCheckinAdminAuthPath,
  canAccessApp: canAccessCheckinAdmin,
  clearSession: clearAdminSession,
  sessionEventName: ADMIN_SESSION_EVENT,
  mobileHeaderTitle: "HUB Check-in",
  homePath: CHECKIN_ADMIN_HOME_PATH,
}
