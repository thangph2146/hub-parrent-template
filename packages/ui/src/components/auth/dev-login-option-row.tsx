import type { DevLoginOption } from "@workspace/api-client"

import { cn } from "../../lib/utils"
import {
  formatDevLoginOptionPrimary,
  formatDevLoginOptionRoleLabels,
} from "./dev-login-utils"

export type DevLoginOptionRowProps = {
  option: DevLoginOption
  className?: string
}

/** Một dòng trong dropdown dev login — tên, email, vai trò tách bạch. */
export function DevLoginOptionRow({ option, className }: DevLoginOptionRowProps) {
  const primary = formatDevLoginOptionPrimary(option)
  const roles = formatDevLoginOptionRoleLabels(option)
  const showEmail =
    Boolean(option.name?.trim()) &&
    option.email.trim().toLowerCase() !== primary.trim().toLowerCase()

  return (
    <span className={cn("flex min-w-0 flex-col gap-1 py-0.5", className)}>
      <span className="font-medium leading-snug text-foreground">{primary}</span>
      {showEmail ? (
        <span className="font-mono text-xs leading-snug break-all text-muted-foreground">
          {option.email}
        </span>
      ) : null}
      {roles.length > 0 ? (
        <span className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <span
              key={role}
              className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-snug text-muted-foreground"
            >
              {role}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  )
}
