import type { DevLoginOption } from "@workspace/api-client"

import { DEV_LOGIN_MANUAL_VALUE } from "./dev-login-constants"

export function resolveDevLoginOption(
  options: DevLoginOption[],
  value: string,
): DevLoginOption | null {
  if (!value || value === DEV_LOGIN_MANUAL_VALUE) return null
  return options.find((option) => String(option.id) === value) ?? null
}

export function formatDevLoginOptionPrimary(option: DevLoginOption): string {
  return option.name?.trim() || option.email
}

export function formatDevLoginOptionRoleLabels(option: DevLoginOption): string[] {
  return (option.roleLabels ?? []).map((label) => label.trim()).filter(Boolean)
}

/** Nhãn trigger — tên + vai trò ngắn gọn. */
export function formatDevLoginOptionTriggerLabel(option: DevLoginOption): string {
  const primary = formatDevLoginOptionPrimary(option)
  const roles = formatDevLoginOptionRoleLabels(option)
  if (roles.length === 0) return primary
  return `${primary} — ${roles.join(", ")}`
}

export function formatDevLoginOptionSecondary(option: DevLoginOption): string {
  const labels = formatDevLoginOptionRoleLabels(option)
  const roles = labels.length > 0 ? ` · ${labels.join(", ")}` : ""
  return `${option.email}${roles}`
}
