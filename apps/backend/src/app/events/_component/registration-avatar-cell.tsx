"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar"
import { getPosterUrlFromValue } from "./utils"

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
}

export function resolveRegistrationAvatarUrl(
  row: Record<string, unknown>,
): string {
  return getPosterUrlFromValue(row.avatar)
}

export function RegistrationAvatarCell({
  row,
  size = "sm",
}: {
  row: Record<string, unknown>
  size?: "sm" | "default" | "lg"
}) {
  const fullName = String(row.fullName ?? row.email ?? "")
  const src = resolveRegistrationAvatarUrl(row)

  return (
    <Avatar size={size} className="size-9">
      {src ? (
        <AvatarImage src={src} alt={fullName || "Avatar"} />
      ) : null}
      <AvatarFallback className="text-xs font-semibold">
        {initialsFromName(fullName || "?")}
      </AvatarFallback>
    </Avatar>
  )
}
