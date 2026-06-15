import { createAuthAdminApi, type DevLoginOption } from "@workspace/api-client"
import { getApiBaseUrl } from "@/lib/admin/api-base-url"

export * from "@workspace/admin-app/modules/auth/_lib/auth-api"

export async function fetchDevLoginOptions(): Promise<DevLoginOption[]> {
  if (process.env.NODE_ENV !== "development") {
    return []
  }

  try {
    return await createAuthAdminApi({
      baseUrl: getApiBaseUrl(),
      devLogTag: "STORE_SYNC_ADMIN",
    }).fetchDevLoginOptions({
      excludeRoles: "student,parent,user",
      activeOnly: true,
    })
  } catch (error) {
    console.warn("[STORE_SYNC_ADMIN] fetchDevLoginOptions failed:", error)
    return []
  }
}
