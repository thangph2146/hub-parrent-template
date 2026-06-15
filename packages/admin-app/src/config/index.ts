export { defineAdminApp } from "./define-admin-app"
export {
  buildAdminShellPaths,
  isPathUnderAdminBase,
  normalizeAdminBasePath,
  rebaseAdminMenuHref,
  resolveAdminDashboardDir,
  type AdminShellPaths,
} from "./admin-access-paths"
export type {
  AdminAppConfig,
  AdminAppMenuConfig,
  AdminModuleId,
  AdminNativeRoutePreserve,
} from "./types"
