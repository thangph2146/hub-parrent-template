import { ApiClient, type ApiClientOptions } from "../client"
import type { DevLoginOptionsQuery } from "../types/dev-login"
import { fetchDevLoginOptions as fetchDevLoginOptionsShared } from "./dev-login"
import { getData, postData } from "./_shared"

export type PublicPaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PublicPagedPayload<T> = {
  data: T[]
  meta: PublicPaginationMeta
}

export type PublicAuthPayload = {
  id: number
  email: string
  name: string | null
  image: string | null
  roles?: Array<{ id: number; name: string; displayName: string }>
}

export type PublicContactRequestInput = {
  name?: string
  fullName?: string
  email: string
  phone?: string
  subject?: string
  address?: string
  program?: string
  major?: string
  subscribeNewsletter?: boolean
  subscribeConsultation?: boolean
  content?: string
}

export type PublicContactRequestResult = {
  id?: string
  message?: string
}

function readIsDev(): boolean {
  if (typeof process !== "undefined" && process.env?.NODE_ENV) {
    return process.env.NODE_ENV === "development"
  }
  const proc = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process
  return proc?.env?.NODE_ENV === "development"
}

/** Cache GET public trên SSR storefront — dev: no-store, prod: revalidate 60s. */
export function publicSsrRequestOptions(): Parameters<ApiClient["get"]>[1] {
  return readIsDev()
    ? { cache: "no-store" }
    : { next: { revalidate: 60 } }
}

export class PublicApi {
  constructor(private readonly http: ApiClient) {}

  listPosts<T = unknown>(
    params?: Record<string, string | number | undefined>,
    options?: Parameters<ApiClient["get"]>[1],
  ) {
    return getData<PublicPagedPayload<T>>(this.http, "/public/posts", {
      query: params,
      ...publicSsrRequestOptions(),
      ...options,
    })
  }

  listPostCategories<T = unknown>(
    params?: { slug?: string },
    options?: Parameters<ApiClient["get"]>[1],
  ) {
    return getData<T[]>(this.http, "/public/categories", {
      query: params,
      ...publicSsrRequestOptions(),
      ...options,
    })
  }

  getPostBySlug<T = unknown>(
    slug: string,
    options?: Parameters<ApiClient["get"]>[1] & { track?: boolean },
  ) {
    const { track, ...rest } = options ?? {}
    return getData<T>(this.http, `/public/posts/${encodeURIComponent(slug)}`, {
      query: track === false ? { track: "false" } : undefined,
      ...publicSsrRequestOptions(),
      ...rest,
    })
  }

  trackPostView(slug: string) {
    return postData<{ viewCount: number }>(
      this.http,
      `/public/posts/${encodeURIComponent(slug)}/view`,
    )
  }

  getPageContents<T = unknown>(
    pageKey: string,
    options?: Parameters<ApiClient["get"]>[1],
  ) {
    return getData<T[] | T>(
      this.http,
      `/public/page-contents/${encodeURIComponent(pageKey)}`,
      {
        ...publicSsrRequestOptions(),
        ...options,
      },
    )
  }

  listEvents<T = unknown>(
    params?: Record<string, string | number | undefined>,
    options?: Parameters<ApiClient["get"]>[1],
  ) {
    return getData<PublicPagedPayload<T>>(this.http, "/public/events", {
      query: params,
      ...publicSsrRequestOptions(),
      ...options,
    })
  }

  getEventBySlug<T = unknown>(
    slug: string,
    options?: Parameters<ApiClient["get"]>[1],
  ) {
    return getData<T>(this.http, `/public/events/${encodeURIComponent(slug)}`, {
      ...publicSsrRequestOptions(),
      ...options,
    })
  }

  listEventCategories<T = unknown>(
    params?: { slug?: string },
    options?: Parameters<ApiClient["get"]>[1],
  ) {
    return getData<T[]>(this.http, "/public/event-categories", {
      query: params,
      ...publicSsrRequestOptions(),
      ...options,
    })
  }

  registerForEvent<T = unknown>(
    eventSlug: string,
    body?: { phone?: string },
    options?: Parameters<ApiClient["post"]>[2],
  ) {
    return postData<T>(
      this.http,
      `/public/events/${encodeURIComponent(eventSlug)}/register`,
      body ?? {},
      options,
    )
  }

  listMyEvents<T = unknown>(options?: Parameters<ApiClient["get"]>[1]) {
    return getData<T[]>(this.http, "/public/me/events", {
      cache: "no-store",
      ...options,
    })
  }

  cancelMyEventRegistration<T = unknown>(
    registrationId: string,
    options?: Parameters<ApiClient["post"]>[2],
  ) {
    return postData<T>(
      this.http,
      `/public/me/event-registrations/${encodeURIComponent(registrationId)}/cancel`,
      undefined,
      options,
    )
  }

  loginWithEmail(body: { email: string; password: string }) {
    return postData<PublicAuthPayload>(this.http, "/public/auth/login", {
      email: body.email.trim(),
      password: body.password,
    })
  }

  loginWithDevelopmentUser(body: { userId: string }) {
    return postData<PublicAuthPayload>(this.http, "/public/auth/dev-login", {
      userId: body.userId.trim(),
    })
  }

  loginGuestWithEmail(body: { email: string; password: string }) {
    return postData<PublicAuthPayload>(this.http, "/public/auth/guest-login", {
      email: body.email.trim(),
      password: body.password,
    })
  }

  loginGuestWithDevelopmentUser(body: { userId: string }) {
    return postData<PublicAuthPayload>(
      this.http,
      "/public/auth/guest-dev-login",
      { userId: body.userId.trim() },
    )
  }

  /** Storefront B2B — không giới hạn role student. */
  loginStoreWithEmail(body: { email: string; password: string }) {
    return postData<PublicAuthPayload>(this.http, "/public/auth/store-login", {
      email: body.email.trim(),
      password: body.password,
    })
  }

  loginStoreWithDevelopmentUser(body: { userId: string }) {
    return postData<PublicAuthPayload>(
      this.http,
      "/public/auth/store-dev-login",
      { userId: body.userId.trim() },
    )
  }

  loginWithGoogle(credential: string) {
    return postData<PublicAuthPayload>(this.http, "/public/auth/google", {
      credential,
    })
  }

  fetchGoogleOAuthConfig() {
    return getData<{ clientId: string }>(this.http, "/public/auth/google/config", {
      cache: "no-store",
    })
  }

  fetchDevLoginOptions(params?: DevLoginOptionsQuery) {
    return fetchDevLoginOptionsShared(this.http, params)
  }

  submitContactRequest(
    body: PublicContactRequestInput,
    options?: Parameters<ApiClient["post"]>[2],
  ) {
    return postData<PublicContactRequestResult>(
      this.http,
      "/public/contact-requests",
      body,
      options,
    )
  }
}

export function createPublicApi(
  options: ApiClientOptions | string,
): PublicApi {
  const opts: ApiClientOptions =
    typeof options === "string" ? { baseUrl: options } : options
  return new PublicApi(new ApiClient(opts))
}
