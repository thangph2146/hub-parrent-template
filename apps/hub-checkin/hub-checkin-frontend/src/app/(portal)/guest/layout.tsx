import type { ReactNode } from "react"
import { EventPortalLayoutProvider } from "@/providers/portal/layout"
import { EventPortalRuntimeBridge } from "@/providers/portal/runtime-bridge"

export default function GuestPortalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <EventPortalRuntimeBridge role="guest">
      <EventPortalLayoutProvider role="guest">{children}</EventPortalLayoutProvider>
    </EventPortalRuntimeBridge>
  )
}
