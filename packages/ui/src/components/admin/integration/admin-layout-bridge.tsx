"use client"

import type { ReactNode } from "react"
import type { AdminLayoutContextValue } from "../types"
import { AdminLayoutProvider } from "../shell/layout-context"
import { AdminShell } from "../shell/shell"

export type AdminLayoutBridgeProps = {
  value: AdminLayoutContextValue
  children: ReactNode
  /** Bật sidebar + header admin (mặc định true). */
  showSidebar?: boolean
}

/** Gắn context + shell — app truyền `value` (auth, menu, branding). */
export function AdminLayoutBridge({
  value,
  children,
  showSidebar = true,
}: AdminLayoutBridgeProps) {
  return (
    <AdminLayoutProvider value={value}>
      <AdminShell isSidebar={showSidebar}>{children}</AdminShell>
    </AdminLayoutProvider>
  )
}
