"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { AdminLayoutContextValue } from "../types"

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
