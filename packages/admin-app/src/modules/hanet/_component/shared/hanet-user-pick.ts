import type { DataTableUserSearchHandlers } from "@ui/components/data-table"
import type { StoreSyncSdk } from "@workspace/api-client"
import { isHanetRegisterImageUrl } from "./hanet-image-url"

export function isNumericUserId(value: string | undefined): value is string {
  return Boolean(value?.trim() && /^\d+$/.test(value.trim()))
}

export function pickHanetAliasId(user: {
  email?: string
  studentCode?: string | null
}): string {
  const email = user.email?.trim() ?? ""
  if (email.includes("@")) return email
  return user.studentCode?.trim() ?? email
}

export function pickHanetImageUrl(avatar: string | null | undefined): string {
  const trimmed = avatar?.trim() ?? ""
  if (!isHanetRegisterImageUrl(trimmed)) return ""
  return trimmed
}

export function createHanetUserSearchHandlers(
  api: StoreSyncSdk
): DataTableUserSearchHandlers {
  return {
    onSearch: async (q) => {
      const res = await api.users.list({ q, page: 1, limit: 10 })
      return res.items.map((user) => ({
        id: user.id,
        label: user.fullName?.trim() || user.email,
        sublabel: user.email,
      }))
    },
    onResolveUser: async (id) => {
      const user = await api.users.get(id)
      return {
        id: user.id,
        label: user.fullName?.trim() || user.email,
        sublabel: user.email,
      }
    },
  }
}

function resolveAbsoluteUploadUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (typeof window === "undefined") return trimmed
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`
  return `${window.location.origin}${path}`
}

/** Tải ảnh từ `/api/uploads/…` (cùng origin) thành File cho multipart register. */
export async function fetchLocalAvatarAsFile(
  avatarUrl: string,
): Promise<File | null> {
  const trimmed = avatarUrl.trim()
  if (!isHanetRegisterImageUrl(trimmed)) return null
  if (!trimmed.startsWith("/api/uploads/") && !/^https?:\/\//i.test(trimmed)) {
    return null
  }

  try {
    const absolute = resolveAbsoluteUploadUrl(trimmed)
    const res = await fetch(absolute, { credentials: "include" })
    if (!res.ok) return null
    const blob = await res.blob()
    const mime = blob.type?.split(";")[0]?.trim() || "image/jpeg"
    if (!["image/jpeg", "image/jpg", "image/png"].includes(mime)) return null
    const ext = mime.includes("png") ? "png" : "jpg"
    const name = trimmed.split("/").pop()?.split("?")[0] || `avatar.${ext}`
    return new File([blob], name.endsWith(`.${ext}`) ? name : `avatar.${ext}`, {
      type: mime,
    })
  } catch {
    return null
  }
}
