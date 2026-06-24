"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar"
import { resolveMediaUrl } from "@ui/lib/resolve-media-url"

import type { StaffRow } from "../shared/types"

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
}

export function StaffAvatarCell({ user }: { user: StaffRow }) {
  const label = user.fullName?.trim() || user.email
  const src = user.avatar?.trim() ? resolveMediaUrl(user.avatar, 160) : ""

  return (
    <Avatar size="lg" className="!size-14 shrink-0">
      {src ? <AvatarImage src={src} alt={label} /> : null}
      <AvatarFallback className="text-sm font-semibold">
        {initialsFromName(label || "?")}
      </AvatarFallback>
    </Avatar>
  )
}
