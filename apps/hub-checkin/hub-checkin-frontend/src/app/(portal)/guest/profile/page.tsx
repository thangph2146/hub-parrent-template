import { redirect } from "next/navigation"
import { portalEventsPath } from "@/lib/portal/event-portal-routes"

export default function GuestProfileRedirectPage() {
  redirect(portalEventsPath("guest"))
}
