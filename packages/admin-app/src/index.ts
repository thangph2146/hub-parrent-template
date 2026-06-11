export { defineAdminApp, type AdminAppConfig } from "./config"
export {
  buildAdminMenuFromConfig,
  BACKEND_ADMIN_MENU_ITEMS,
  resolveAdminMenuIcons,
} from "./menu"
export {
  STANDARD_ADMIN_MODULE_ROUTES,
  moduleAppPath,
  moduleHref,
  packageModuleExport,
} from "./registry"
export {
  AdminAppRuntimeProvider,
  useAdminApi,
  useAdminApp,
  useAdminAuth,
  useAdminModuleNavigation,
} from "./runtime"
