import type { AdminLayoutStaticConfig } from "@ui/components/admin";
import type { AuthUser } from "@workspace/api-client";
import { isStoreAuthPath } from "@/lib/auth-routes";
import {
  STORE_SESSION_EVENT,
  STORE_SESSION_STORAGE_KEY,
} from "@/lib/store-auth";
import { STORE_PORTAL_MENU_TREE } from "./store-portal-menu-tree";

export const STORE_PORTAL_HOME = "/store/orders";

export function canAccessStorePortal(user: AuthUser): boolean {
  return typeof user?.id === "number" && Number.isFinite(user.id) && user.id > 0;
}

export function clearStorePortalSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORE_SESSION_STORAGE_KEY);
}

/** Cấu hình layout admin shell cho cổng cửa hàng. */
export const STORE_PORTAL_LAYOUT_STATIC: AdminLayoutStaticConfig = {
  menuTree: STORE_PORTAL_MENU_TREE,
  loginPath: "/login",
  isAuthPath: isStoreAuthPath,
  canAccessApp: canAccessStorePortal,
  clearSession: clearStorePortalSession,
  sessionEventName: STORE_SESSION_EVENT,
  mobileHeaderTitle: "Cửa hàng",
  homePath: STORE_PORTAL_HOME,
  profilePath: "/store/profile",
  accessDeniedReason: "store_denied",
};
