import { createAuthAdminApi, type DevLoginOption } from "@workspace/api-client"
import { getApiBaseUrl } from "@/lib/admin/api-base-url"

export * from "@workspace/admin-app/features/auth/auth-api"

/** Dev picker cổng /admin — loại sinh viên/phụ huynh/khách, giữ staff (super_admin, admin, editor, event_staff, …). */
export async function fetchDevLoginOptions(): Promise<DevLoginOption[]> {
  if (process.env.NODE_ENV !== "development") {
    return []
  }

  try {
    return await createAuthAdminApi({
      baseUrl: getApiBaseUrl(),
      devLogTag: "HUB_CHECKIN_ADMIN",
    }).fetchDevLoginOptions({
      excludeRoles: "student,parent,user",
      activeOnly: true,
    })
  } catch (error) {
    console.warn("[HUB_CHECKIN_ADMIN] fetchDevLoginOptions failed:", error)
    return []
  }
}
