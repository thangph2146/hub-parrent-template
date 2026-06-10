"use client"

import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"
import { HeaderAccountMenu } from "@/components/shared/header-account-menu"
import { HeaderAuth } from "@/components/shared/header-auth"
import {
  HeaderGuestAccessDropdown,
  HeaderGuestAccessOptions,
} from "@/components/shared/header-guest-access-menu"
import {
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
  const showAdmin = !pathname.startsWith("/admin")

  if (layout === "sheet") {
    if (session) {
      return (
        <HeaderAccountMenu
          layout="sheet"
          showAdmin={showAdmin}
          onNavigate={onSheetNavigate}
        />
      )
    }

    return (
      <HeaderGuestAccessOptions
        showAdmin={showAdmin}
        onNavigate={onSheetNavigate}
      />
    )
  }

  if (session) {
    return <HeaderAccountMenu showAdmin={showAdmin} />
  }

  if (!showAdmin) {
    return <HeaderAuth />
  }

  return <HeaderGuestAccessDropdown showAdmin={showAdmin} />
}
