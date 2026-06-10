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

export function formatDevLoginOptionSecondary(option: DevLoginOption): string {
  const roles =
    option.roleLabels.length > 0 ? ` · ${option.roleLabels.join(", ")}` : ""
  return `${option.email}${roles}`
}
