import type { AdminAppConfig } from "../config/types"
import type {
  AdminMenuLeafData,
  AdminMenuTreeItemData,
} from "./admin-menu-tree.items"
import { BACKEND_ADMIN_MENU_ITEMS } from "./admin-menu-tree.items"

function normalizeMenuLabel(label: string): string {
  return String(label)
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function stripNativeMeta(
  native: AdminMenuTreeItemData & { insertAfter?: string; replaceLabel?: string },
): AdminMenuTreeItemData {
  const { insertAfter: _a, replaceLabel: _b, ...group } = native
  return group
}

function findNativeReplacement(
  label: string,
  nativeGroups: NonNullable<AdminAppConfig["menu"]>["nativeGroups"],
) {
  const norm = normalizeMenuLabel(label)
  for (const raw of nativeGroups ?? []) {
    if (raw.replaceLabel && normalizeMenuLabel(raw.replaceLabel) === norm) {
      return stripNativeMeta(raw)
    }
  }
  return null
}

function moduleToHref(mod: string): string {
  if (mod === "file-storage") return "/file-storage"
  return `/${mod}`
}

function buildIncludeHrefs(config: AdminAppConfig): Set<string> {
  const hrefs = new Set(config.menu?.alwaysIncludeHrefs ?? ["/", "/events"])
  for (const mod of config.modules ?? []) {
    hrefs.add(moduleToHref(mod))
  }
  for (const ex of config.menu?.excludeHrefs ?? []) {
    hrefs.delete(ex)
  }
  return hrefs
}

function remapHrefForConfig(
  href: string,
  config: AdminAppConfig,
  overrides: Record<string, string>,
) {
  if (Object.prototype.hasOwnProperty.call(overrides, href)) {
    return overrides[href]!
  }
  const basePath = config.basePath ?? ""
  if (href === "/") {
    const rel = config.dashboard?.relativePath ?? "tong-quan"
    const prefix = basePath.replace(/\/$/, "")
    return prefix ? `${prefix}/${rel}` : `/${rel}`
  }
  const prefix = basePath.replace(/\/$/, "")
  return prefix ? `${prefix}${href}` : href
}

function remapNativeGroup(
  group: AdminMenuTreeItemData,
  config: AdminAppConfig,
  overrides: Record<string, string>,
): AdminMenuTreeItemData {
  if (group.type !== "group") return group
  return {
    ...group,
    children: group.children.map((c) => ({
      ...c,
      href:
        typeof c.href === "string" && c.href.startsWith(config.basePath || "/admin")
          ? c.href
          : remapHrefForConfig(c.href, config, overrides),
    })),
  }
}

function applyAppendToGroup(
  menu: AdminMenuTreeItemData[],
  config: AdminAppConfig,
): AdminMenuTreeItemData[] {
  const appendToGroup = config.menu?.appendToGroup ?? {}
  return menu.map((item) => {
    if (item.type !== "group") return item
    const extra = appendToGroup[item.label]
    if (!extra?.length) return item
    return { ...item, children: [...item.children, ...extra] }
  })
}

/** Lọc menu gốc main theo module bật + remap href theo `basePath`. */
export function buildAdminMenuFromConfig(
  config: AdminAppConfig,
  source: AdminMenuTreeItemData[] = BACKEND_ADMIN_MENU_ITEMS,
): AdminMenuTreeItemData[] {
  const includeHrefs = buildIncludeHrefs(config)
  const overrides = config.menu?.hrefOverrides ?? {}
  const nativeGroups = config.menu?.nativeGroups ?? []
  const out: AdminMenuTreeItemData[] = []

  for (const item of source) {
    if (item.type === "leaf") {
      if (!includeHrefs.has(item.href)) continue
      out.push({
        ...item,
        href: remapHrefForConfig(item.href, config, overrides),
      })
      continue
    }

    const replacement = findNativeReplacement(item.label, nativeGroups)
    if (replacement) {
      out.push(remapNativeGroup(replacement, config, overrides))
      continue
    }

    const children = item.children
      .filter((c: AdminMenuLeafData) => includeHrefs.has(c.href))
      .map((c) => ({
        ...c,
        href: remapHrefForConfig(c.href, config, overrides),
      }))
    if (children.length === 0) continue
    out.push({ ...item, children })
  }

  return applyAppendToGroup(out, config)
}
