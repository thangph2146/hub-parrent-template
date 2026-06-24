import { ApiError, createStoreSyncSdk } from "@workspace/api-client"

export type AdminSdk = ReturnType<typeof createStoreSyncSdk>

let boundApi: AdminSdk | null = null

/** App gọi từ `AdminAppRuntimeProvider` khi mount. */
export function bindAdminApi(instance: AdminSdk) {
  boundApi = instance
}

function getBoundApi(): AdminSdk {
  if (!boundApi) {
    throw new Error(
      "Admin API chưa bind — bọc layout bằng AdminAppRuntimeProvider",
    )
  }
  return boundApi
}

/** SDK dùng trong module admin — delegate tới instance app inject. */
export const api: AdminSdk = new Proxy({} as AdminSdk, {
  get(_target, prop) {
    const sdk = getBoundApi() as unknown as Record<string | symbol, unknown>
    const value = sdk[prop as keyof AdminSdk]
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(sdk)
    }
    return value
  },
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
export { ApiError, createStoreSyncSdk }
export { createAdminSdk, resolveImportApi } from "./create-admin-sdk"
export type { CreateAdminSdkOptions } from "./create-admin-sdk"
