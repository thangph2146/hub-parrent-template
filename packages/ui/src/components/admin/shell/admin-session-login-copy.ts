import type { AuthUser } from "@workspace/api-client"
import type { DevLoginOption } from "@workspace/api-client"

export type AdminSessionLoginCopyContext = {
  pagePath?: string | null
  loginPath?: string | null
  sessionStorageKey?: string | null
  portalLabel?: string | null
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
    "CẤU HÌNH ĐĂNG NHẬP — HUB ADMIN",
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
