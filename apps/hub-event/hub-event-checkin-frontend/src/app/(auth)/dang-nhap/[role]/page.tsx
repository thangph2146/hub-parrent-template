import { notFound, redirect } from "next/navigation"
import { safeRelativeNext } from "@/lib/auth-routes"
import {
  isEventPortalRole,
  portalEventsPath,
  portalLoginPath,
  type EventPortalRole,
} from "@/lib/event-portal-routes"

type LegacyDangNhapRolePageProps = {
  params: Promise<{ role: string }>
  searchParams: Promise<{ next?: string }>
}

/** Legacy `/dang-nhap/{role}` → `/dang-nhap?next=…` */
export default async function LegacyDangNhapRolePage({
  params,
  searchParams,
}: LegacyDangNhapRolePageProps) {
  const { role: rawRole } = await params
  if (!isEventPortalRole(rawRole)) notFound()

  const role = rawRole as EventPortalRole
  const { next: rawNext } = await searchParams
  const returnPath = safeRelativeNext(rawNext, portalEventsPath(role))
  redirect(portalLoginPath(returnPath))
}
