"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"
import {
  AdminLayoutBridge,
  buildAdminLayoutValue,
} from "@ui/components/admin"
import {
  STUDENT_PORTAL_LAYOUT_STATIC,
  eventSessionToAuthUser,
} from "@/config/student-layout-static"
import {
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

export function StudentPortalLayoutProvider({
  children,
}: {
  children: ReactNode
}) {
  const router = useRouter()
  const session = useEventSession()
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setClientReady(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const logout = () => {
    clearEventSession()
    router.replace("/")
    router.refresh()
  }

  const value = useMemo(
    () =>
      buildAdminLayoutValue({
        user: session ? eventSessionToAuthUser(session) : null,
        clientReady,
        logout,
        branding: {
          siteName: "HUB Events",
          siteDescription: "Cổng sinh viên",
        },
        static: STUDENT_PORTAL_LAYOUT_STATIC,
      }),
    [clientReady, logout, session],
  )

  return <AdminLayoutBridge value={value}>{children}</AdminLayoutBridge>
}
