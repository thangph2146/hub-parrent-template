/**
 * Sinh checkin-admin-menu-tree.tsx từ @workspace/admin-app — chỉ menu cần cho check-in.
 *
 * Usage: node script-system/sync/sync-checkin-menu-tree.cjs
 */
const fs = require("node:fs")
const path = require("node:path")
const { ROOT } = require("../lib/monorepo-root.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")
const { resolveAdminAppConfigFile } = require("../lib/admin-app-config-path.cjs")
const {
  buildCheckinMenu,
  verifyMenuOrderAgainstMain,
} = require("./lib/build-checkin-menu.cjs")
const { loadAdminMenuItems } = require("./lib/load-admin-menu-items.cjs")

const CHECKIN_FRONT = path.join(ROOT, PRODUCT_LINES["hub-checkin"].frontend.path)
const CONFIG_PATH =
  resolveAdminAppConfigFile(CHECKIN_FRONT) ??
  path.join(CHECKIN_FRONT, "admin.sync-modules.json")
const OUT_PATH = path.join(
  CHECKIN_FRONT,
  "src/config/admin/checkin-admin-menu-tree.tsx",
)
/** Module admin.sync-modules → href main backend (không prefix /admin). */
const MODULE_HREF_OVERRIDES = {
  "file-storage": "/file-storage",
}

function moduleToHref(mod) {
  return MODULE_HREF_OVERRIDES[mod] ?? `/${mod}`
}

function collectIcons(items) {
  const icons = new Set()
  for (const item of items) {
    icons.add(item.icon)
    if (item.type === "group") {
      for (const c of item.children) icons.add(c.icon)
    }
  }
  return [...icons].sort()
}

function emitLeaf(leaf, indent) {
  const lines = [
    `${indent}href: ${JSON.stringify(leaf.href)},`,
    `${indent}label: ${JSON.stringify(leaf.label)},`,
    `${indent}icon: ${leaf.icon},`,
    `${indent}permission: ${leaf.permission === null ? "null" : JSON.stringify(leaf.permission)},`,
  ]
  if (leaf.anyPermission !== undefined) {
    lines.push(`${indent}anyPermission: ${JSON.stringify(leaf.anyPermission)},`)
  }
  if (leaf.roleGuard !== undefined) {
    lines.push(`${indent}roleGuard: ${JSON.stringify(leaf.roleGuard)},`)
  }
  if (leaf.adminOnly !== undefined) {
    lines.push(`${indent}adminOnly: ${leaf.adminOnly},`)
  }
  return lines.join("\n")
}

function emitItem(item, indent) {
  if (item.type === "leaf") {
    return `${indent}{\n${indent}  type: "leaf",\n${emitLeaf(item, `${indent}  `)}\n${indent}}`
  }

  const children = item.children
    .map((c) => `${indent}    {\n${emitLeaf(c, `${indent}      `)}\n${indent}    }`)
    .join(",\n")

  return `${indent}{\n${indent}  type: "group",\n${indent}  label: ${JSON.stringify(item.label)},\n${indent}  icon: ${item.icon},\n${indent}  children: [\n${children},\n${indent}  ],\n${indent}}`
}

function emitMenuTsx(menu) {
  const icons = collectIcons(menu)
  const iconImports = icons.join(",\n  ")

  const items = menu
    .map((item) => emitItem(item, "  "))
    .join(",\n")

  return `/** AUTO-GENERATED — pnpm pull:checkin (script-system/sync/sync-checkin-menu-tree.cjs). Không sửa tay. */
import {
  ${iconImports},
} from "lucide-react"
import type { AdminMenuTreeItem } from "@ui/components/admin"

export const CHECKIN_ADMIN_MENU_TREE: AdminMenuTreeItem[] = [
${items},
]
`
}

function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
  const mainItems = loadAdminMenuItems()
  const menu = buildCheckinMenu(mainItems, config, moduleToHref)

  const orderErrors = verifyMenuOrderAgainstMain(mainItems, menu, config)
  if (orderErrors.length > 0) {
    console.error("[sync-checkin-menu] thứ tự menu không khớp admin-menu-tree.items.ts:")
    for (const err of orderErrors) console.error(`  - ${err}`)
    process.exit(1)
  }

  const tsx = emitMenuTsx(menu)

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  fs.writeFileSync(OUT_PATH, tsx)

  const leafCount = menu.reduce(
    (n, item) =>
      n + (item.type === "leaf" ? 1 : item.children.length),
    0,
  )
  console.log(
    `[sync-checkin-menu] wrote ${path.relative(ROOT, OUT_PATH)} (${menu.length} groups/leaves, ${leafCount} menu items)`,
  )
  console.log(
    `[sync-checkin-menu] order OK — ${menu.map((i) => i.label).join(" → ")}`,
  )
}

main()

