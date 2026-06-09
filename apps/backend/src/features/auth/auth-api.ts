import {
  createAuthAdminApi,
  DEFAULT_API_URL,
  type AuthLoginPayload,
  type AuthUser,
  type DevLoginOption,
  type RegisterLeadPayload,
  type RegisterRequestPayload,
} from "@workspace/api-client"

export type {
  AuthLoginPayload,
  RegisterRequestPayload,
  RegisterLeadPayload,
  DevLoginOption,
}

function getAuthAdminApi() {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(
    /\/$/,
    ""
  )
  return createAuthAdminApi({
    baseUrl,
    devLogTag: "HUB_ADMIN",
  })
}

function normalizePermissionValues(value: unknown): string[] {
  const visit = (input: unknown): string[] => {
    if (Array.isArray(input)) {
      return input.flatMap((item) => visit(item))
    }
    if (typeof input !== "string") {
      return []
    }

    const trimmed = input.trim()
    if (!trimmed) {
      return []
    }

    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        return visit(JSON.parse(trimmed))
      } catch {
        return [trimmed]
      }
    }

    return [trimmed]
  }

  return [...new Set(visit(value))]
}

export async function fetchAdminSessionPayload(userId: string) {
  return getAuthAdminApi().fetchAdminSession(userId)
}

export async function loginWithEmail(body: {
  email: string
  password: string
}) {
  return getAuthAdminApi().loginWithEmail(body)
}

export async function loginWithGoogle(credential: string) {
  return getAuthAdminApi().loginWithGoogle(credential)
}

export function fetchGoogleOAuthConfig() {
  return getAuthAdminApi().fetchGoogleOAuthConfig()
}

export async function loginWithDevelopmentUser(body: { userId: string }) {
  return getAuthAdminApi().loginWithDevelopmentUser(body)
}

export function toAdminSessionUser(payload: AuthLoginPayload): AuthUser {
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name?.trim() || payload.email,
    image: payload.image,
    phone: null,
    address: null,
    roles: payload.roles,
    permissions: normalizePermissionValues(payload.permissions),
  }
}

export function registerAccount(body: RegisterRequestPayload) {
  return getAuthAdminApi().registerAccount(body)
}

export function submitRegisterRequest(body: RegisterLeadPayload) {
  return getAuthAdminApi().submitRegisterRequest(body)
}

export async function fetchDevLoginOptions() {
  if (process.env.NODE_ENV !== "development") {
    return [] as DevLoginOption[]
  }

  try {
    return await getAuthAdminApi().fetchDevLoginOptions()
  } catch {
    return []
  }
}
