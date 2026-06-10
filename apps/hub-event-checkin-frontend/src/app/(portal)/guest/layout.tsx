import type { ReactNode } from "react"
import { EventPortalLayoutProvider } from "@/providers/event-portal-layout"

export default function GuestPortalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <EventPortalLayoutProvider role="guest">{children}</EventPortalLayoutProvider>
  )
}
