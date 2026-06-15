import { redirect } from "next/navigation"
import { safeRelativeNext } from "@/lib/auth-routes"
import { portalEventsPath, portalLoginPath } from "@/lib/portal/event-portal-routes"

type LegacyStudentLoginPageProps = {
  searchParams: Promise<{ next?: string }>
}

/** Legacy `/student/dang-nhap` → `/dang-nhap?next=…` */
export default async function LegacyStudentLoginPage({
  searchParams,
}: LegacyStudentLoginPageProps) {
  const { next: rawNext } = await searchParams
  const returnPath = safeRelativeNext(rawNext, portalEventsPath("student"))
  redirect(portalLoginPath(returnPath))
}
