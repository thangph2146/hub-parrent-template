import { ApiClient, type ApiClientOptions } from "../client"
import type { DevLoginOptionsQuery } from "../types/dev-login"
import { fetchDevLoginOptions as fetchDevLoginOptionsShared } from "./dev-login"
import { getData, postData } from "./_shared"

export type AuthLoginPayload = {
  id: number
  email: string
  name: string | null
  image: string | null
  permissions: string[]
  roles: Array<{ id: number; name: string; displayName: string }>
}

export type RegisterRequestPayload = {
  fullName: string
  email: string
  password: string
  phone?: string
  address?: string
}

export type RegisterLeadPayload = {
  fullName: string
  phone: string
  email: string
  address?: string
  program?: string
  major?: string
  subscribeNewsletter?: boolean
  subscribeConsultation?: boolean
  content?: string
}

export type {
  DevLoginOption,
  DevLoginOptionsQuery,
  DevLoginRole,
} from "../types/dev-login"

export class AuthAdminApi {
  constructor(private readonly http: ApiClient) {}

  loginWithEmail(body: { email: string; password: string }) {
    return postData<AuthLoginPayload>(this.http, "/auth/admin/login", body)
  }

  loginWithGoogle(credential: string) {
    return postData<AuthLoginPayload>(this.http, "/auth/admin/google", {
      credential,
    })
  }

  loginWithDevelopmentUser(body: { userId: string }) {
    return postData<AuthLoginPayload>(this.http, "/auth/admin/dev-login", body)
  }

  fetchGoogleOAuthConfig() {
    return getData<{ clientId: string }>(this.http, "/auth/admin/google/config")
  }

  fetchAdminSession(userId: string) {
    return getData<AuthLoginPayload>(this.http, "/auth/admin/me", {
      headers: { "X-User-Id": userId.trim() },
    })
  }

  registerAccount(body: RegisterRequestPayload) {
    return postData<AuthLoginPayload>(this.http, "/public/register", body)
  }

  submitRegisterRequest(body: RegisterLeadPayload) {
    return postData<{ id: string; message: string }>(
      this.http,
      "/public/contact-requests",
      body,
    )
  }

  fetchDevLoginOptions(params?: DevLoginOptionsQuery) {
    return fetchDevLoginOptionsShared(this.http, params)
  }
}

export function createAuthAdminApi(
  options: ApiClientOptions | string,
): AuthAdminApi {
  const opts: ApiClientOptions =
    typeof options === "string" ? { baseUrl: options } : options
  return new AuthAdminApi(new ApiClient(opts))
}
