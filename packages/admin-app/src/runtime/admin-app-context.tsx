"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import type { AuthUser, createStoreSyncSdk } from "@workspace/api-client"
import { bindAdminApi } from "../lib/api"
import type { AdminAppConfig } from "../config/types"
import { useEffect } from "react"

/** Session user từ app host — cùng shape `AuthUser` API. */
export type AdminAppAuthUser = AuthUser

/** Adapter auth — module chỉ cần `user`; sign-in cần thêm `login*`. */
export type AdminAppAuthContext = {
  user: AdminAppAuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login?: (email: string, password: string) => Promise<unknown>
  loginDevelopment?: (userId: string) => Promise<unknown>
  loginGoogle?: (credential: string) => Promise<unknown>
  logout?: () => void
}

export type AdminAppRuntimeAdapters = {
  useAuth: () => AdminAppAuthContext
  api: ReturnType<typeof createStoreSyncSdk>
  /** Cập nhật cache session sau khi lưu hồ sơ portal (check-in SV/khách). */
  patchAuthProfile?: (patch: AuthProfilePatch) => void
}

export type AuthProfilePatch = {
  name?: string
  image?: string | null
}

type AdminAppContextValue = AdminAppConfig & AdminAppRuntimeAdapters

const AdminAppContext = createContext<AdminAppContextValue | null>(null)

export function AdminAppRuntimeProvider({
  config,
  adapters,
  children,
}: {
  config: AdminAppConfig
  adapters: AdminAppRuntimeAdapters
  children: ReactNode
}) {
  const value = useMemo(
    () => ({
      ...config,
      ...adapters,
    }),
    [config, adapters],
  )

  useEffect(() => {
    bindAdminApi(adapters.api)
  }, [adapters.api])

  return (
    <AdminAppContext.Provider value={value}>{children}</AdminAppContext.Provider>
  )
}

export function useAdminApp(): AdminAppContextValue {
  const ctx = useContext(AdminAppContext)
  if (!ctx) {
    throw new Error(
      "useAdminApp: bọc layout admin bằng AdminAppRuntimeProvider",
    )
  }
  return ctx
}

/** Session guard trong module package — chỉ expose user + flags. */
export function useAdminAuth() {
  return useAdminApp().useAuth()
}

/** Auth đầy đủ từ app host (sign-in, layout, …). */
export function useAuth() {
  return useAdminApp().useAuth()
}

/** Thay `import { api } from '@workspace/admin-app/lib/api'` trong module package. */
export function useAdminApi() {
  return useAdminApp().api
}

export function usePatchAuthProfile() {
  return useAdminApp().patchAuthProfile
}
