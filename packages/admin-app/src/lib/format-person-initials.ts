/** Chữ cái đầu từ họ tên — dùng avatar placeholder admin. */
export function formatPersonInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]!
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts[parts.length - 1]!
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
  return initials || "?"
}
