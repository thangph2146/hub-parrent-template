import { createStoreSyncSdk } from "@workspace/api-client"
import { getApiBaseUrl } from "@/lib/admin/api-base-url"
import { getAdminDevAuthLogContext, getAdminUserId } from "./auth-session"

export const api = createStoreSyncSdk({
  baseUrl: getApiBaseUrl(),
  getUserId: () => {
    if (typeof window === "undefined") return null
    return getAdminUserId()
  },
  devLogging: process.env.NODE_ENV === "development",
  devLogTag: "HUB_PARENT_ADMIN",
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
} from "@workspace/api-client"
export { ApiError } from "@workspace/api-client"

