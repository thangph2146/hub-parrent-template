import { redirect } from "next/navigation"
import { portalEventsPath } from "@/lib/event-portal-routes"

/** @deprecated Dùng `/(portal)/[role]/events`. */
export function SiteMyEventsPage() {
  redirect(portalEventsPath("guest"))
}
