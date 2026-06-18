import type { AdminAppConfig } from "@workspace/admin-app/config"
import { normalizeAdminBasePath } from "@workspace/admin-app/config"
import portalAppConfig from "../../../config/portal.app.config.json"

type PortalShellSegments = {
  eventsSegment?: string
  profileSegment?: string
}

export type EventPortalRole = "student" | "guest"

export type CheckinPortalAppConfig = AdminAppConfig & {
  shell?: PortalShellSegments
}

export type CheckinPortalShellPaths = {
  basePath: string
  eventsPath: string
  profilePath: string
  homePath: string
}

const PORTAL_CONFIGS = portalAppConfig as Record<
  EventPortalRole,
  CheckinPortalAppConfig
>

function joinPortalSegments(
  basePath: string,
  ...segments: Array<string | undefined>
): string {
  const base = normalizeAdminBasePath(basePath)
  const parts = [base, ...segments.map((s) => String(s ?? "").replace(/^\/+|\/+$/g, ""))]
    .flatMap((part) => part.split("/").filter(Boolean))
    .filter(Boolean)
  return parts.length ? `/${parts.join("/")}` : "/"
}

export function getCheckinPortalAppConfig(
  role: EventPortalRole,
): CheckinPortalAppConfig {
  return PORTAL_CONFIGS[role]
}

/** Path shell cổng SV/khách — derive từ `portal.app.config.json`. */
export function buildCheckinPortalShellPaths(
  role: EventPortalRole,
): CheckinPortalShellPaths {
  const config = getCheckinPortalAppConfig(role)
  const eventsSegment = config.shell?.eventsSegment ?? "events"
  const profileSegment = config.shell?.profileSegment ?? "profile"
  const eventsPath = joinPortalSegments(config.basePath, eventsSegment)
  const profilePath = joinPortalSegments(config.basePath, profileSegment)

  return {
    basePath: joinPortalSegments(config.basePath),
    eventsPath,
    profilePath,
    homePath: eventsPath,
  }
}

export function isCheckinPortalShellPath(
  pathname: string | null | undefined,
  role: EventPortalRole,
): boolean {
  if (!pathname) return false
  const { basePath } = buildCheckinPortalShellPaths(role)
  const normalized = pathname.replace(/\/+$/, "") || "/"
  return normalized === basePath || normalized.startsWith(`${basePath}/`)
}
