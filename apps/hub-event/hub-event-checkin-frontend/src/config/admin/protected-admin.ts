const RAW = process.env.NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS ?? ""
const LIST: string[] = RAW.split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export function isProtectedAdminEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false
  return LIST.includes(email.trim().toLowerCase())
}

/** Chỉ email trong `NEXT_PUBLIC_PROTECTED_ADMIN_EMAILS` được sửa vai trò `super_admin`. */
export function canEditSuperAdminRole(
  actorEmail: string | null | undefined
): boolean {
  return isProtectedAdminEmail(actorEmail)
}

/** Tài khoản protected chỉ được sửa khi chính email đó đăng nhập (self-edit). */
export function canEditProtectedAdminUser(
  actorEmail: string | null | undefined,
  targetEmail: string | null | undefined
): boolean {
  if (!isProtectedAdminEmail(targetEmail)) return true
  if (!actorEmail || !targetEmail) return false
  return actorEmail.trim().toLowerCase() === targetEmail.trim().toLowerCase()
}
