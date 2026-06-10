import { redirect } from "next/navigation"
import { portalEventsPath } from "@/lib/event-portal-routes"

export default function StudentPortalIndexPage() {
  redirect(portalEventsPath("student"))
}
