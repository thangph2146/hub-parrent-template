import type { ApiClient } from "../client"
import { getData } from "./_shared"
import type { DevLoginOption, DevLoginOptionsQuery } from "../types/dev-login"

function buildDevLoginQuery(
  params?: DevLoginOptionsQuery,
): Record<string, string> | undefined {
  if (!params) return undefined
  const query: Record<string, string> = {}
  if (params.role?.trim()) query.role = params.role.trim()
  if (params.roles?.trim()) query.roles = params.roles.trim()
  if (params.excludeRoles?.trim()) {
    query.excludeRoles = params.excludeRoles.trim()
  }
  if (params.emailSuffix?.trim()) query.emailSuffix = params.emailSuffix.trim()
  if (params.activeOnly === false) query.activeOnly = "false"
  return Object.keys(query).length > 0 ? query : undefined
}

/** GET /public/dev-login-options — development only. */
export async function fetchDevLoginOptions(
  http: ApiClient,
  params?: DevLoginOptionsQuery,
): Promise<DevLoginOption[]> {
  return getData<DevLoginOption[]>(http, "/public/dev-login-options", {
    query: buildDevLoginQuery(params),
    cache: "no-store",
  })
}
