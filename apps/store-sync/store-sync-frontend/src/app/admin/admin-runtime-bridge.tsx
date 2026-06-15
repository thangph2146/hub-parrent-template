"use client"

import { useMemo } from "react"
import adminAppConfig from "../../../admin.app.config.json"
import type { AdminAppConfig } from "@workspace/admin-app/config"
import { AdminAppRuntimeProvider } from "@workspace/admin-app/runtime"
import {
  useAuth as useAppAuth,
  useClientReady,
} from "@/providers/admin/auth-provider"
import { api } from "@/lib/admin/api"

function useAdminAppAuthAdapter() {
  const clientReady = useClientReady()
  const session = useAppAuth()
  return useMemo(
    () => ({
      ...session,
      isLoading: !clientReady,
      isAuthenticated: clientReady && session.user !== null,
    }),
    [clientReady, session],
  )
}

export function AdminRuntimeBridge({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAppRuntimeProvider
      config={adminAppConfig as AdminAppConfig}
      adapters={{ useAuth: useAdminAppAuthAdapter, api }}
    >
      {children}
    </AdminAppRuntimeProvider>
  )
}
