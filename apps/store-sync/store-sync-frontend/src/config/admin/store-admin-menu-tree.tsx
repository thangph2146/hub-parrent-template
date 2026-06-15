import type { AdminAppConfig } from "@workspace/admin-app/config"
import {
  buildAdminMenuFromConfig,
  resolveAdminMenuIcons,
} from "@workspace/admin-app/menu"
import type { AdminMenuTreeItem } from "@ui/components/admin"
import adminAppConfig from "../../../admin.app.config.json"

export const STORE_ADMIN_MENU_TREE: AdminMenuTreeItem[] = resolveAdminMenuIcons(
  buildAdminMenuFromConfig(adminAppConfig as AdminAppConfig),
)
