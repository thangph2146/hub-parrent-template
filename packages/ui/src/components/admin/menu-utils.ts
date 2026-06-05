import { canUserAccess } from "@workspace/api-client"
import type { AdminLayoutUser, AdminMenuLeaf, AdminMenuTreeItem } from "./types"

const SUPER_ROLES = ["super_admin", "admin"] as const

function isSuperUser(user: AdminLayoutUser): boolean {
  return (
    user.roles?.some((r) =>
      SUPER_ROLES.includes(r.name as (typeof SUPER_ROLES)[number])
    ) ?? false
  )
}

function canSeeLeaf(
  user: AdminLayoutUser | null,
  item: AdminMenuLeaf
): boolean {
  if (!user) return false
  if (isSuperUser(user)) return true
  if (item.roleGuard) {
    const matched = user.roles?.some((r) => r.name === item.roleGuard) ?? false
    if (matched) return true
  }
  if (item.adminOnly) return false
  if (item.anyPermission?.length) {
    return item.anyPermission.some((p) => canUserAccess(user, p))
  }
  if (item.permission === null) return true
  return canUserAccess(user, item.permission)
}

export function getVisibleMenuItems(
  user: AdminLayoutUser | null,
  menuTree: AdminMenuTreeItem[]
): AdminMenuTreeItem[] {
  if (!user) return []
  return menuTree.reduce<AdminMenuTreeItem[]>((acc, item) => {
    if (item.type === "leaf") {
      if (canSeeLeaf(user, item)) acc.push(item)
      return acc
    }
    const children = item.children.filter((child) => canSeeLeaf(user, child))
    if (children.length === 0) return acc
    acc.push({ ...item, children })
    return acc
  }, [])
}

function getFlatVisibleLeaves(items: AdminMenuTreeItem[]): AdminMenuLeaf[] {
  return items.flatMap((item) =>
    item.type === "leaf" ? [item] : item.children
  )
}

export function getLegacyVisibleMenuLeaves(
  user: AdminLayoutUser | null,
  menuTree: AdminMenuTreeItem[]
): AdminMenuLeaf[] {
  return getFlatVisibleLeaves(getVisibleMenuItems(user, menuTree))
}
