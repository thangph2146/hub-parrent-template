import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sidebar = fs.readFileSync(
  path.join(root, "apps/backend/src/components/sidebar.tsx"),
  "utf8",
)
const start = sidebar.indexOf("const menuTree:")
const endMatch = sidebar.slice(start).match(/\]\r?\n\r?\nconst SUPER_ROLES/)
if (!endMatch) throw new Error("SUPER_ROLES marker not found")
const end = start + endMatch.index + 1
const tree = sidebar.slice(start, end)

const header = `"use client"

import {
  ShieldCheck,
  Cog,
  Database,
  LayoutDashboard,
  Tags,
  FolderOpen,
  FileText,
  Users,
  FolderTree,
  Headset,
  GraduationCap,
  UserCheck,
  BookOpen,
  Network,
  TableProperties,
  Mic,
  MapPin,
  Layers,
  Building2,
  Library,
  CalendarDays,
  CalendarPlus,
  Camera,
  Search,
  LayoutTemplate,
  Monitor,
} from "lucide-react"
import { PERMISSION_CODES, type PermissionCode } from "@workspace/api-client"
import type { AdminMenuLeaf, AdminMenuTreeItem } from "@ui/components/admin"

`

const body = tree
  .replaceAll("MenuTreeItem", "AdminMenuTreeItem")
  .replaceAll("MenuLeaf", "AdminMenuLeaf")

const out = path.join(root, "apps/backend/src/config/admin-menu-tree.tsx")
fs.writeFileSync(
  out,
  `${header}${body}\n\nexport const BACKEND_ADMIN_MENU_TREE: AdminMenuTreeItem[] = menuTree\n`,
)
console.log("Wrote", out)
