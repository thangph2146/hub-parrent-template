"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import { PERMISSION_CODES, type PermissionCode } from "@workspace/api-client"
import type { HanetPartnerEndpoint } from "@workspace/admin-app/lib/hanet-postman"
import { HanetPartnerApiDialogTrigger } from "./hanet-partner-api-dialog"

const DEFAULT_PERMISSIONS: PermissionCode[] = [
  PERMISSION_CODES.EVENTS_VIEW,
  PERMISSION_CODES.EVENTS_MANAGE,
  PERMISSION_CODES.FACE_DATA_VIEW,
]

function resolvePageEndpoints(
  endpoints?: readonly HanetPartnerEndpoint[],
  endpoint?: HanetPartnerEndpoint
): readonly HanetPartnerEndpoint[] {
  if (endpoints?.length) return endpoints
  if (endpoint) return [endpoint]
  return []
}

export function HanetModuleShell({
  icon,
  title,
  subtitle,
  endpoint,
  endpoints,
  endpointExtra: _endpointExtra,
  permissions = DEFAULT_PERMISSIONS,
  headerActions,
  readOnlyHint,
  contentClassName,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  endpoint?: HanetPartnerEndpoint
  endpoints?: readonly HanetPartnerEndpoint[]
  endpointExtra?: string
  permissions?: PermissionCode[]
  headerActions?: ReactNode
  readOnlyHint?: ReactNode
  contentClassName?: string
  children: ReactNode
}) {
  const pageEndpoints = resolvePageEndpoints(endpoints, endpoint)

  return (
    <AdminPageGuard permissions={permissions}>
      <AdminPageSection className="space-y-4">
        <AdminListPageHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          readOnlyHint={readOnlyHint}
          actions={
            <>
              {headerActions}
              <HanetPartnerApiDialogTrigger endpoints={pageEndpoints} />
            </>
          }
        />
        <div className={contentClassName ?? "max-w-5xl"}>{children}</div>
      </AdminPageSection>
    </AdminPageGuard>
  )
}
