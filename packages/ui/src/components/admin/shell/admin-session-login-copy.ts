import { resolveAdminPortalLabel } from "../../../lib/admin-operation-report-branding"
import type { AuthUser, DevLoginOption } from "@workspace/api-client"
import { getVisibleMenuItems } from "../menu-utils"
import type { AdminMenuLeaf, AdminMenuTreeItem } from "../types"

export type AdminSessionLoginCopyContext = {
  pagePath?: string | null
  loginPath?: string | null
  sessionStorageKey?: string | null
  portalLabel?: string | null
  menuTree?: AdminMenuTreeItem[]
  enabledAdminModules?: string[]
}

type MenuLeafRef = {
  group?: string
  label: string
  href: string
  leaf: AdminMenuLeaf
}

function collectMenuLeafRefs(items: AdminMenuTreeItem[]): MenuLeafRef[] {
  const out: MenuLeafRef[] = []
  for (const item of items) {
    if (item.type === "leaf") {
      out.push({ label: item.label, href: item.href, leaf: item })
      continue
    }
    for (const child of item.children) {
      out.push({
        group: item.label,
        label: child.label,
        href: child.href,
        leaf: child,
      })
    }
  }
  return out
}

function formatMenuVisibilityHint(leaf: AdminMenuLeaf): string {
  if (leaf.adminOnly) return "adminOnly (chỉ super_admin / admin)"
  if (leaf.roleGuard) return `roleGuard: ${leaf.roleGuard}`
  if (leaf.anyPermission?.length) {
    return `anyPermission: ${leaf.anyPermission.join(" | ")}`
  }
  if (leaf.permission) return `permission: ${leaf.permission}`
  return "không có ràng buộc quyền"
}

function formatMenuTreeLines(
  title: string,
  items: AdminMenuTreeItem[],
): string[] {
  if (items.length === 0) return [title, "(trống)", ""]
  const lines = [title, ""]
  for (const item of items) {
    if (item.type === "leaf") {
      lines.push(`• ${item.label} → ${item.href}`)
      continue
    }
    lines.push(`• ${item.label} (${item.children.length} mục)`)
    for (const child of item.children) {
      lines.push(`  - ${child.label} → ${child.href}`)
    }
  }
  lines.push("")
  return lines
}

function formatHiddenMenuLines(
  moduleMenu: AdminMenuTreeItem[],
  visibleMenu: AdminMenuTreeItem[],
): string[] {
  const allRefs = collectMenuLeafRefs(moduleMenu)
  const visibleHrefs = new Set(collectMenuLeafRefs(visibleMenu).map((ref) => ref.href))
  const hidden = allRefs.filter((ref) => !visibleHrefs.has(ref.href))
  if (hidden.length === 0) return []

  const lines = [`── Menu bật nhưng ẩn với session (${hidden.length}) ──`, ""]
  for (const ref of hidden) {
    const prefix = ref.group ? `[${ref.group}] ` : ""
    lines.push(`• ${prefix}${ref.label} → ${ref.href}`)
    lines.push(`  Điều kiện hiển thị: ${formatMenuVisibilityHint(ref.leaf)}`)
  }
  lines.push("")
  return lines
}

function appendMenuCopyLines(
  lines: string[],
  user: AuthUser,
  context: AdminSessionLoginCopyContext,
): void {
  const menuTree = context.menuTree ?? []
  if (menuTree.length === 0 && !(context.enabledAdminModules?.length ?? 0)) {
    return
  }

  const enabledModules = context.enabledAdminModules ?? []
  if (enabledModules.length > 0) {
    lines.push(
      `Module admin bật (${enabledModules.length}): ${enabledModules.join(", ")}`,
      "",
    )
  }

  if (menuTree.length === 0) return

  lines.push(
    ...formatMenuTreeLines(
      `── Sidebar menu — module bật (${collectMenuLeafRefs(menuTree).length} mục) ──`,
      menuTree,
    ),
  )

  const visibleMenu = getVisibleMenuItems(user, menuTree)
  lines.push(
    ...formatMenuTreeLines(
      `── Sidebar menu — đang hiển thị (${collectMenuLeafRefs(visibleMenu).length} mục) ──`,
      visibleMenu,
    ),
  )
  lines.push(...formatHiddenMenuLines(menuTree, visibleMenu))
}

function formatRoleLabel(role: { name: string; displayName?: string }): string {
  const code = role.name
  const label = role.displayName?.trim()
  if (label && label !== code) return `${label} (${code})`
  return code
}

function formatUserRoles(user: AuthUser): string {
  if (!user.roles?.length) return "Chưa gán vai trò"
  return user.roles.map(formatRoleLabel).join(", ")
}

/** Map phiên hiện tại → shape `DevLoginOption` (dev login dropdown). */
export function buildAdminSessionDevLoginOption(user: AuthUser): DevLoginOption {
  const roles = user.roles ?? []
  const roleNames = roles.map((role) => role.name)
  const roleLabels = roles.map(
    (role) => role.displayName?.trim() || role.name,
  )

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: true,
    roleNames,
    roleLabels,
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName?.trim() || role.name,
    })),
    description:
      roleLabels.length > 0 ? roleLabels.join(", ") : "Chưa gán vai trò",
  }
}

function buildSessionSnapshot(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    phone: user.phone ?? null,
    address: user.address ?? null,
    updatedAt: user.updatedAt ?? null,
    roles: user.roles ?? [],
    permissions: user.permissions ?? [],
  }
}

export function buildAdminSessionLoginCopyText(
  user: AuthUser,
  context: AdminSessionLoginCopyContext = {},
): string {
  const path = context.pagePath?.trim() || "(không xác định)"
  const lines: string[] = [
    `CẤU HÌNH ĐĂNG NHẬP — ${resolveAdminPortalLabel()}`,
    "",
    `Tài khoản: ${user.email} (ID: ${user.id})`,
    `Tên hiển thị: ${user.name?.trim() || "(chưa có)"}`,
    `Vai trò hiện tại: ${formatUserRoles(user)}`,
    `Trang hiện tại: ${path}`,
    `Header API: X-User-Id: ${user.id}`,
  ]

  if (context.portalLabel?.trim()) {
    lines.push(`Cổng: ${context.portalLabel.trim()}`)
  }
  if (context.loginPath?.trim()) {
    lines.push(`Đường dẫn đăng nhập: ${context.loginPath.trim()}`)
  }
  if (context.sessionStorageKey?.trim()) {
    lines.push(`Session storage key: ${context.sessionStorageKey.trim()}`)
  }

  const permissions = user.permissions ?? []
  if (permissions.length > 0) {
    lines.push("", `Quyền đang có (${permissions.length} mã):`)
    lines.push(permissions.join(", "))
  }

  appendMenuCopyLines(lines, user, context)

  const devOption = buildAdminSessionDevLoginOption(user)
  lines.push(
    "",
    "── Dev login option (JSON) ──",
    JSON.stringify(devOption, null, 2),
    "",
    "── Session snapshot (JSON, không mật khẩu) ──",
    JSON.stringify(buildSessionSnapshot(user), null, 2),
    "",
    "Ghi chú: Dùng email trên với dev-login hoặc POST /auth/admin/dev-login (development).",
  )

  return lines.join("\n")
}
