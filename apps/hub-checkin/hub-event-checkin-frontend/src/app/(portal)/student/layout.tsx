import type { ReactNode } from "react"
import { QueryProvider } from "@/providers/admin/query-provider"
import { EventPortalLayoutProvider } from "@/providers/portal/layout"
import { EventPortalRuntimeBridge } from "@/providers/portal/runtime-bridge"

export default function StudentPortalLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <QueryProvider>
      <EventPortalRuntimeBridge role="student">
        <EventPortalLayoutProvider role="student">
          {children}
        </EventPortalLayoutProvider>
      </EventPortalRuntimeBridge>
    </QueryProvider>
  )
}
