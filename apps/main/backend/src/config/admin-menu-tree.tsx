"use client"

import { resolveAdminMenuIcons } from "@/config/admin-menu-icons"
import { BACKEND_ADMIN_MENU_ITEMS } from "@/config/admin-menu-tree.items"
import type { AdminMenuTreeItem } from "@ui/components/admin"

export const BACKEND_ADMIN_MENU_TREE: AdminMenuTreeItem[] =
  resolveAdminMenuIcons(BACKEND_ADMIN_MENU_ITEMS)
