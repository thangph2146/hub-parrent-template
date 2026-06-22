import { ApiError } from "@workspace/api-client"

/** Thông báo 403 chuẩn từ `PermissionsGuard` (API). */
export const ADMIN_FORBIDDEN_ACTION_MESSAGE =
  "Bạn không có quyền thực hiện hành động này"

export type AdminAccessDeniedScope = "page" | "action"

export function isAdminForbiddenPermissionError(err: unknown): boolean {
  if (err instanceof ApiError && err.status === 403) {
    return err.message.trim() === ADMIN_FORBIDDEN_ACTION_MESSAGE
  }
  if (err instanceof Error) {
    return err.message.trim() === ADMIN_FORBIDDEN_ACTION_MESSAGE
  }
  return false
}
