export type AvatarChangeLimitState = {
  /** `null` = không giới hạn. */
  maxChanges: number | null
  changesUsed: number
  canChangeAvatar: boolean
  remainingChanges: number | null
}

const STORAGE_PREFIX = "hub-profile-avatar-changes:"

export function readAvatarChangeCount(userId: string | number): number {
  if (typeof window === "undefined") return 0
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
  const parsed = Number.parseInt(raw ?? "0", 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function clearAvatarChangeCount(userId: string | number): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(`${STORAGE_PREFIX}${userId}`)
}

export function recordAvatarChange(userId: string | number): number {
  const next = readAvatarChangeCount(userId) + 1
  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, String(next))
  }
  return next
}

export function normalizeMaxAvatarChanges(
  value: number | undefined,
): number | null {
  if (value === undefined) return null
  if (!Number.isFinite(value) || value < 0) return null
  return Math.floor(value)
}

/** Số lần đã dùng khi mở form — đồng bộ localStorage với ảnh đã lưu trên server. */
export function resolveInitialAvatarChangesUsed(
  userId: string | number,
  initialAvatar: string | null | undefined,
  maxAvatarChanges: number | null = null,
): number {
  const persisted = initialAvatar?.trim() ?? ""
  const stored = readAvatarChangeCount(userId)

  // Upload từng ghi localStorage nhưng chưa lưu DB — cho phép thử lại.
  if (stored > 0 && !persisted) {
    clearAvatarChangeCount(userId)
    return 0
  }

  if (stored > 0) return stored

  if (maxAvatarChanges !== null && maxAvatarChanges > 0 && persisted) {
    return maxAvatarChanges
  }

  return 0
}

export function buildAvatarChangeLimitState(options: {
  maxAvatarChanges: number | null
  changesUsed: number
}): AvatarChangeLimitState {
  const { maxAvatarChanges, changesUsed } = options
  if (maxAvatarChanges === null) {
    return {
      maxChanges: null,
      changesUsed,
      canChangeAvatar: true,
      remainingChanges: null,
    }
  }
  if (maxAvatarChanges === 0) {
    return {
      maxChanges: 0,
      changesUsed,
      canChangeAvatar: false,
      remainingChanges: 0,
    }
  }
  const remaining = Math.max(0, maxAvatarChanges - changesUsed)
  return {
    maxChanges: maxAvatarChanges,
    changesUsed,
    canChangeAvatar: remaining > 0,
    remainingChanges: remaining,
  }
}

export function formatAvatarChangeLimitMessage(
  state: AvatarChangeLimitState,
): string | null {
  if (state.maxChanges === null) return null
  if (state.maxChanges === 0) {
    return "Ảnh đại diện không được phép thay đổi trên cổng này."
  }
  if (state.maxChanges === 1) {
    return state.canChangeAvatar
      ? "Bạn chỉ được tải ảnh đại diện một lần duy nhất. Hãy chọn ảnh phù hợp trước khi tải lên."
      : "Bạn chỉ được tải ảnh đại diện một lần duy nhất."
  }
  if (!state.canChangeAvatar) {
    return `Bạn đã dùng hết ${state.maxChanges} lần được phép đổi ảnh đại diện.`
  }
  return `Bạn còn ${state.remainingChanges}/${state.maxChanges} lần được phép đổi ảnh đại diện.`
}
