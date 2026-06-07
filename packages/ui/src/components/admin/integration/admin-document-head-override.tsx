"use client"

import { createContext, useContext, type ReactNode } from "react"

export type AdminDocumentHeadOverride = {
  siteName?: string
  siteDescription?: string
  metaTitle?: string
  metaDescription?: string
}

const AdminDocumentHeadOverrideContext =
  createContext<AdminDocumentHeadOverride | null>(null)

export function AdminDocumentHeadOverrideProvider({
  value,
  children,
}: {
  value: AdminDocumentHeadOverride | null
  children: ReactNode
}) {
  return (
    <AdminDocumentHeadOverrideContext.Provider value={value}>
      {children}
    </AdminDocumentHeadOverrideContext.Provider>
  )
}

export function useAdminDocumentHeadOverride() {
  return useContext(AdminDocumentHeadOverrideContext)
}
