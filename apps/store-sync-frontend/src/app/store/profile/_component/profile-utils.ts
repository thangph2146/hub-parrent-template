export function formatProfileDateTime(value?: string | null) {
  if (!value) return "Chưa có dữ liệu";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

export function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const PROFILE_FIELD_CLASS =
  "h-10 rounded-lg border-border/70 bg-background/70 px-3 shadow-inner";

export const PROFILE_TEXTAREA_CLASS =
  "min-h-28 rounded-lg border-border/70 bg-background/70 px-3 py-2.5 shadow-inner";

export const PROFILE_ACTION_BAR_CLASS =
  "flex justify-end border-t border-border/60 pt-4";
