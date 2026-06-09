import type { AdminLayoutStaticConfig } from "@ui/components/admin"
import { BACKEND_ADMIN_MENU_TREE } from "@/config/admin-menu-tree"
import { ADMIN_SESSION_EVENT, clearAdminSession } from "@/lib/auth-session"
import { AUTH_LOGIN_PATH, isAuthPath } from "@/lib/auth-routes"
import { canAccessStaffAdmin } from "@workspace/api-client"

/** Cấu hình layout admin cố định của app backend. */
export const BACKEND_ADMIN_LAYOUT_STATIC: AdminLayoutStaticConfig = {
  menuTree: BACKEND_ADMIN_MENU_TREE,
  loginPath: AUTH_LOGIN_PATH,
  isAuthPath,
  canAccessApp: canAccessStaffAdmin,
  clearSession: clearAdminSession,
  sessionEventName: ADMIN_SESSION_EVENT,
  mobileHeaderTitle: "B2B Admin",
  fullWidthPaths: ["/graph"],
}
