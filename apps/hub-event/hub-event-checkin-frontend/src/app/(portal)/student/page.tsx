import { redirect } from "next/navigation"
import { portalEventsPath } from "@/lib/portal/event-portal-routes"

export default function StudentPortalIndexPage() {
  redirect(portalEventsPath("student"))
}
