"use client"

import { usePathname } from "next/navigation"
import { useEffect, useSyncExternalStore } from "react"
import { HeaderAccountMenu } from "@/components/shared/header-account-menu"
import { HeaderAuth } from "@/components/shared/header-auth"
import { HeaderStaffAccountMenu } from "@/components/shared/header-staff-account-menu"
import { useAdminSession } from "@/components/shared/use-admin-session"
import {
  HeaderGuestAccessDropdown,
  HeaderGuestAccessOptions,
} from "@/components/shared/header-guest-access-menu"
import {
  getActiveCheckinSessionKind,
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

type HeaderAccessClusterProps = {
  layout?: "bar" | "sheet"
  onSheetNavigate?: () => void
}

export function HeaderAccessCluster({
  layout = "bar",
  onSheetNavigate,
}: HeaderAccessClusterProps) {
  const pathname = usePathname()
  const session = useEventSession()
  const adminUser = useAdminSession()
  const showAdminEntry = !pathname.startsWith("/admin")

  useEffect(() => {
    getActiveCheckinSessionKind()
  }, [])

  if (adminUser && !session) {
    return (
      <HeaderStaffAccountMenu
        layout={layout}
        onNavigate={onSheetNavigate}
      />
    )
  }

  if (layout === "sheet") {
    if (session) {
      return (
        <HeaderAccountMenu layout="sheet" onNavigate={onSheetNavigate} />
      )
    }

    return (
      <HeaderGuestAccessOptions
        showAdmin={showAdminEntry}
        onNavigate={onSheetNavigate}
      />
    )
  }

  if (session) {
    return <HeaderAccountMenu />
  }

  if (!showAdminEntry) {
    return <HeaderAuth />
  }

  return <HeaderGuestAccessDropdown showAdmin={showAdminEntry} />
}
