/**
 * Sinh checkin-admin-menu-tree.tsx từ main/backend — chỉ menu cần cho check-in.
 *
 * Usage: node script-system/sync-checkin-menu-tree.cjs
 */
const fs = require("node:fs")
const path = require("node:path")
const { execSync } = require("node:child_process")
const { ROOT } = require("../lib/paths.cjs")
const { PRODUCT_LINES } = require("../lib/monorepo-apps.cjs")
const CHECKIN_FRONT = path.join(ROOT, PRODUCT_LINES["hub-event"].frontend.path)
const CONFIG_PATH = path.join(CHECKIN_FRONT, "admin.sync-modules.json")
const OUT_PATH = path.join(
  CHECKIN_FRONT,
  "src/config/admin/checkin-admin-menu-tree.tsx",
)
const EXPORT_SCRIPT = path.join(
  ROOT,
  PRODUCT_LINES.main.backend.path,
  "scripts/export-menu-items.mts",
)
const API_DIR = path.join(ROOT, PRODUCT_LINES.main.api.path)

/** Module admin.sync-modules → href main backend (không prefix /admin). */
const MODULE_HREF_OVERRIDES = {
  "file-storage": "/file-storage",
}

function moduleToHref(mod) {
  return MODULE_HREF_OVERRIDES[mod] ?? `/${mod}`
}

function loadMainMenuItems() {
  const raw = execSync(`npx tsx "${EXPORT_SCRIPT}"`, {
    cwd: API_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  })
  return JSON.parse(raw)
}

function buildIncludeHrefs(config) {
  const hrefs = new Set(config.menu?.alwaysIncludeHrefs ?? ["/", "/events"])
  for (const mod of config.modules ?? []) {
    hrefs.add(moduleToHref(mod))
  }
  for (const ex of config.menu?.excludeHrefs ?? []) {
    hrefs.delete(ex)
  }
  return hrefs
}

function filterMenu(items, includeHrefs) {
  const out = []
  for (const item of items) {
    if (item.type === "leaf") {
      if (includeHrefs.has(item.href)) out.push(item)
      continue
    }
    const children = item.children.filter((c) => includeHrefs.has(c.href))
    if (children.length > 0) {
      out.push({ ...item, children })
    }
  }
  return out
}

function remapHref(href, overrides) {
  if (Object.prototype.hasOwnProperty.call(overrides, href)) {
    return overrides[href]
  }
  if (href === "/") return "/admin/tong-quan"
  return `/admin${href}`
}

function remapMenu(items, overrides) {
  return items.map((item) => {
    if (item.type === "leaf") {
      return { ...item, href: remapHref(item.href, overrides) }
    }
    return {
      ...item,
      children: item.children.map((c) => ({
        ...c,
        href: remapHref(c.href, overrides),
      })),
    }
  })
}

function appendNative(menu, config) {
  const next = [...menu]
  const appendToGroup = config.menu?.appendToGroup ?? {}

  for (const [groupLabel, leaves] of Object.entries(appendToGroup)) {
    const group = next.find((g) => g.type === "group" && g.label === groupLabel)
    if (group) {
      group.children.push(...leaves)
    }
  }

  for (const native of config.menu?.nativeGroups ?? []) {
    next.push(native)
  }

  return next
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
  const includeHrefs = buildIncludeHrefs(config)
  const overrides = config.menu?.hrefOverrides ?? {
    "/": "/admin/tong-quan",
    "/events": "/admin",
  }

  let menu = loadMainMenuItems()
  menu = filterMenu(menu, includeHrefs)
  menu = remapMenu(menu, overrides)
  menu = appendNative(menu, config)

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
}

main()
