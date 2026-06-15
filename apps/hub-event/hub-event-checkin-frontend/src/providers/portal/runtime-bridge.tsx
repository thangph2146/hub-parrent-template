"use client"

import { useMemo, useSyncExternalStore } from "react"
import type { AdminAppConfig } from "@workspace/admin-app/config"
import { AdminAppRuntimeProvider } from "@workspace/admin-app/runtime"
import { getCheckinPortalAppConfig } from "@/config/portal/access"
import type { EventPortalRole } from "@/config/portal/access"
import { api } from "@/lib/site/api"
import {
  clearEventSession,
  patchEventSessionProfile,
  readEventSession,
  subscribeEventSession,
} from "@/lib/portal/event-session"
import { eventSessionToAuthUser } from "@/config/portal/layout-static"

function usePortalAuthAdapter() {
  const session = useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null,
  )

  return useMemo(
    () => ({
      user: session ? eventSessionToAuthUser(session) : null,
      isLoading: false,
      isAuthenticated: session !== null,
      logout: () => clearEventSession(),
    }),
    [session],
  )
}

export function EventPortalRuntimeBridge({
  role,
  children,
}: {
  role: EventPortalRole
  children: React.ReactNode
}) {
  const config = getCheckinPortalAppConfig(role) as AdminAppConfig

  return (
    <AdminAppRuntimeProvider
      config={config}
      adapters={{
        useAuth: usePortalAuthAdapter,
        api,
        patchAuthProfile: (patch) => {
          patchEventSessionProfile({
            name: patch.name,
            image: patch.image ?? undefined,
          })
        },
      }}
    >
      {children}
    </AdminAppRuntimeProvider>
  )
}
