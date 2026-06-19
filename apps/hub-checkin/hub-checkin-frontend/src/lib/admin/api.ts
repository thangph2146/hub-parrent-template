import { createStoreSyncSdk } from "@workspace/api-client"
import { getApiBaseUrl } from "@/lib/admin/api-base-url"
import { getAdminDevAuthLogContext, getAdminUserId } from "./auth-session"

/**
 * Single SDK instance shared across the admin panel.
 * `X-User-Id` lấy từ phiên đăng nhập (sessionStorage) để RBAC trên API khớp.
 */
export const api = createStoreSyncSdk({
  baseUrl: getApiBaseUrl(),
  getUserId: () => {
    if (typeof window === "undefined") return null
    return getAdminUserId()
  },
  // Bắt buộc bật rõ: trong browser không có globalThis.process nên api-client
  // không tự nhận NODE_ENV; Next vẫn inline process.env.NODE_ENV ở đây.
  devLogging: process.env.NODE_ENV === "development",
  devLogTag: "HUB_CHECKIN_ADMIN",
  getDevAuthContext: () => getAdminDevAuthLogContext(),
})

export type {
  AccountProfile,
  AuthUser,
  ChangeAccountPasswordInput,
  ChangePasswordInput,
  UpdateAccountInput,
  CreateUserInput,
  RbacPermission,
  RbacRole,
  User,
  UserRoleRef,
  Category,
  CategoryUsage,
  CreateCategoryInput,
  UpdateCategoryInput,
  UpdateProfileInput,
  UpdateUserInput,
  ContactRequest,
  UpdateContactRequestInput,
  ParentStudent,
  AddStudentInput,
  ParentStudent as ParentStudentAdmin,
  UpdateParentStudentInput,
} from "@workspace/api-client"
export { ApiError } from "@workspace/api-client"
