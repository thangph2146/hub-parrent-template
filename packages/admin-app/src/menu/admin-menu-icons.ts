import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Building2,
  CalendarDays,
  CalendarPlus,
  CalendarCheck,
  Camera,
  Cog,
  Database,
  FileText,
  FolderOpen,
  FolderTree,
  GraduationCap,
  Headset,
  Image,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  MapPin,
  Mic,
  Monitor,
  Network,
  Package,
  PlugZap,
  ScanFace,
  ShieldCheck,
  ShoppingCart,
  TableProperties,
  Tags,
  UserCheck,
  Users,
} from "lucide-react"
import type {
  AdminMenuLeafData,
  AdminMenuTreeItemData,
} from "./admin-menu-tree.items"
import type { AdminMenuLeaf, AdminMenuTreeItem } from "@ui/components/admin"

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Building2,
  CalendarDays,
  CalendarPlus,
  CalendarCheck,
  Camera,
  Cog,
  Database,
  FileText,
  FolderOpen,
  FolderTree,
  GraduationCap,
  Headset,
  Image,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  MapPin,
  Mic,
  Monitor,
  Network,
  Package,
  PlugZap,
  ScanFace,
  ShieldCheck,
  ShoppingCart,
  TableProperties,
  Tags,
  UserCheck,
  Users,
}

function resolveIcon(name: string): LucideIcon {
  const icon = ICONS[name]
  if (!icon) {
    throw new Error(`[admin-menu-icons] unknown icon: ${name}`)
  }
  return icon
}

function resolveLeaf(leaf: AdminMenuLeafData): AdminMenuLeaf {
  const { icon, ...rest } = leaf
  return { ...rest, icon: resolveIcon(icon) }
}

export function resolveAdminMenuIcons(
  items: AdminMenuTreeItemData[],
): AdminMenuTreeItem[] {
  return items.map((item) => {
    if (item.type === "leaf") {
      return { type: "leaf", ...resolveLeaf(item) }
    }
    return {
      type: "group",
      label: item.label,
      icon: resolveIcon(item.icon),
      children: item.children.map(resolveLeaf),
    }
  })
}
