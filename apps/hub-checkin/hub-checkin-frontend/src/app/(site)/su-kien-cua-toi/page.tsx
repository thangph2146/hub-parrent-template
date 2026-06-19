import { redirect } from "next/navigation"
import { portalEventsPath } from "@/lib/portal/event-portal-routes"

/** Legacy URL — chuyển sang `/guest/events`. */
export default function SuKienCuaToiRedirectPage() {
  redirect(portalEventsPath("guest"))
}
