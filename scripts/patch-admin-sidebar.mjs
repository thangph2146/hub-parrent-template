import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const file = path.join(root, "packages/ui/src/components/admin/admin-sidebar.tsx")
let s = fs.readFileSync(file, "utf8")

const newImports = `"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShieldCheck,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"
import { Button } from "../button"
import { cn } from "../../lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible"
import { useAdminLayout } from "./admin-layout-context"
import type { AdminLayoutUser, AdminMenuLeaf, AdminMenuTreeItem } from "./types"
import {
  getLegacyVisibleMenuLeaves,
  getVisibleMenuItems,
} from "./admin-menu-utils"

`

const headEnd = s.indexOf("const menuTree:")
if (headEnd < 0) throw new Error("menuTree not found")
const menuEndMatch = s.slice(headEnd).match(/\]\r?\n\r?\nconst SUPER_ROLES/)
if (!menuEndMatch) throw new Error("menu end not found")
const menuEnd = headEnd + menuEndMatch.index
const fnStart = s.indexOf("function displayNameOf", menuEnd)
if (fnStart < 0) throw new Error("displayNameOf not found")

s = newImports + s.slice(fnStart)

s = s.replaceAll("AuthUser", "AdminLayoutUser")

s = s.replace(
  /function getFlatVisibleLeaves\(items: AdminMenuTreeItem\[\]\): AdminMenuLeaf\[\] \{\n  return items\.flatMap\([\s\S]*?\)\n\}\n\nfunction getLegacyVisibleItems\(user: AdminLayoutUser \| null\): AdminMenuLeaf\[\] \{\n  const visible = getVisibleMenuItems\(user\)\n  return getFlatVisibleLeaves\(visible\)\n\}\n\n/,
  "",
)

s = s.replace(
  /const \{ user \} = useAuth\(\)/,
  "const { user, menuTree } = useAdminLayout()",
)
s = s.replace(
  /const visible = getVisibleMenuItems\(user\)\n  const collapsedVisible = getLegacyVisibleItems\(user\)/,
  "const visible = getVisibleMenuItems(user, menuTree)\n  const collapsedVisible = getLegacyVisibleMenuLeaves(user, menuTree)",
)

s = s.replace(
  /const \{ user, logout \} = useAuth\(\)\n  const \{ siteName, siteDescription \} = useSiteConfig\(\)/,
  "const { user, logout, siteName, siteDescription } = useAdminLayout()",
)
s = s.replace(
  /const \{ logout \} = useAuth\(\)\n  const \{ siteName, siteDescription \} = useSiteConfig\(\)/,
  "const { logout, siteName, siteDescription } = useAdminLayout()",
)

fs.writeFileSync(file, s)
console.log("OK", file)
