import { redirect } from "next/navigation"
import { safeRelativeNext } from "@/lib/auth-routes"
import { portalEventsPath, portalLoginPath } from "@/lib/event-portal-routes"

type LegacyGuestLoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

/** Legacy `/guest/dang-nhap` → `/dang-nhap?next=…` */
export default async function LegacyGuestLoginPage({
  searchParams,
}: LegacyGuestLoginPageProps) {
  const { next: rawNext } = await searchParams
  const returnPath = safeRelativeNext(rawNext, portalEventsPath("guest"))
  redirect(portalLoginPath(returnPath))
}
