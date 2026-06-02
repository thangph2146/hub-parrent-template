"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { AdminLayoutUser, AdminMenuTreeItem } from "./types"

export type AdminLayoutContextValue = {
  user: AdminLayoutUser | null
  clientReady: boolean
  logout: () => void | Promise<void>
  menuTree: AdminMenuTreeItem[]
  siteName: string
  siteDescription: string
  loginPath: string
  isAuthPath: (pathname: string) => boolean
  canAccessApp: (user: AdminLayoutUser) => boolean
  clearSession: () => void
  sessionEventName: string
  mobileHeaderTitle?: string
  fullWidthPaths?: string[]
}

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null)

export function AdminLayoutProvider({
  value,
  children,
}: {
  value: AdminLayoutContextValue
  children: ReactNode
}) {
  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  )
}

export function useAdminLayout(): AdminLayoutContextValue {
  const ctx = useContext(AdminLayoutContext)
  if (!ctx) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider")
  }
  return ctx
}
