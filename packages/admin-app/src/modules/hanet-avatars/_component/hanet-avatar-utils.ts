import { resolveMediaUrl } from "@ui/lib/resolve-media-url"

export function hanetAvatarSrc(imagePath: string): string {
  const trimmed = imagePath.trim()
  if (!trimmed || trimmed.startsWith("hanet:person:")) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return resolveMediaUrl(trimmed, 240)
}

export function hanetAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
}

export function hanetAvatarLabel(row: {
  displayName?: string | null
  hanetAliasId?: string | null
  hanetPersonId?: string | null
}): string {
  return (
    row.displayName?.trim() ||
    row.hanetAliasId?.trim() ||
    row.hanetPersonId?.trim() ||
    "—"
  )
}

/** Nhãn field cho alias HANET (mã SV, email, …). */
export function hanetAliasFieldLabel(alias: string): string {
  const value = alias.trim()
  if (!value) return "Alias"
  if (value.includes("@")) return "Email"
  if (/^\d{6,}$/.test(value)) return "Mã SV"
  return "Alias ID"
}

export function formatHanetAvatarDate(iso: string | null | undefined): string {
  if (!iso?.trim()) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/** Rút gọn ID dài giữa chừng — hiển thị gọn trên thẻ. */
export function truncateMiddleId(
  value: string,
  head = 10,
  tail = 6,
): string {
  const trimmed = value.trim()
  if (trimmed.length <= head + tail + 1) return trimmed
  return `${trimmed.slice(0, head)}…${trimmed.slice(-tail)}`
}
