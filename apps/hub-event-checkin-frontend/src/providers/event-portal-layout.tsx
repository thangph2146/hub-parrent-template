"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"
import {
  AdminLayoutBridge,
  buildAdminLayoutValue,
} from "@ui/components/admin"
import {
  buildEventPortalLayoutStatic,
  eventSessionToAuthUser,
  getPortalSiteDescription,
} from "@/config/event-portal-layout-static"
import {
  portalEventsPath,
  resolveEventPortalRole,
  type EventPortalRole,
} from "@/lib/event-portal-routes"
import {
  buildLoginHref,
  clearEventSession,
  readEventSession,
  subscribeEventSession,
} from "@/lib/event-auth"

function useEventSession() {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null,
  )
}

export function EventPortalLayoutProvider({
  role,
  children,
}: {
  role: EventPortalRole
  children: ReactNode
}) {
  const router = useRouter()
  const session = useEventSession()
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setClientReady(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!clientReady) return
    if (!session) {
      router.replace(buildLoginHref(portalEventsPath(role)))
      return
    }
    const sessionRole = resolveEventPortalRole(session)
    if (sessionRole && sessionRole !== role) {
      router.replace(portalEventsPath(sessionRole))
    }
  }, [clientReady, role, router, session])

  const logout = useCallback(() => {
    clearEventSession()
    router.replace("/")
    router.refresh()
  }, [router])

  const staticConfig = useMemo(
    () => buildEventPortalLayoutStatic(role),
    [role],
  )

  const value = useMemo(
    () =>
      buildAdminLayoutValue({
        user: session ? eventSessionToAuthUser(session) : null,
        clientReady,
        logout,
        branding: {
          siteName: "HUB Events",
          siteDescription: getPortalSiteDescription(role),
          isReady: true,
        },
        static: staticConfig,
      }),
    [clientReady, logout, role, session, staticConfig],
  )

  return <AdminLayoutBridge value={value}>{children}</AdminLayoutBridge>
}
