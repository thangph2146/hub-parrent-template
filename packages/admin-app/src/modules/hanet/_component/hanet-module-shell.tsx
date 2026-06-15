"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Badge } from "@ui/components/badge"
import {
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"
import { PERMISSION_CODES, type PermissionCode } from "@workspace/api-client"
import {
  HANET_POSTMAN_DOCS_URL,
  type HanetPartnerEndpoint,
} from "@workspace/admin-app/lib/hanet-postman"

const DEFAULT_PERMISSIONS: PermissionCode[] = [
  PERMISSION_CODES.EVENTS_VIEW,
  PERMISSION_CODES.EVENTS_MANAGE,
  PERMISSION_CODES.FACE_DATA_VIEW,
]

export function HanetPartnerApiBadge({
  endpoint,
  extra,
}: {
  endpoint: HanetPartnerEndpoint
  extra?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs">
      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
        {endpoint.group}
      </Badge>
      <code className="text-[10px] text-muted-foreground">
        {endpoint.partnerMethod} {endpoint.partnerPath}
      </code>
      <span className="hidden text-muted-foreground/50 sm:inline">→</span>
      <code className="text-[10px] text-foreground/80">
        {endpoint.hubMethod} {endpoint.hubPath}
        {extra ?? ""}
      </code>
      <Link
        href={HANET_POSTMAN_DOCS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
      >
        Postman
        <ExternalLink className="size-3" aria-hidden />
      </Link>
    </div>
  )
}

export function HanetModuleShell({
  icon,
  title,
  subtitle,
  endpoint,
  endpointExtra,
  permissions = DEFAULT_PERMISSIONS,
  contentClassName,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  endpoint?: HanetPartnerEndpoint
  endpointExtra?: string
  permissions?: PermissionCode[]
  /** Mặc định `max-w-5xl`; truyền `max-w-full` cho trang có bảng rộng. */
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <AdminPageGuard permissions={permissions}>
      <AdminPageSection className="space-y-4">
        <AdminListPageHeader icon={icon} title={title} subtitle={subtitle} />
        {endpoint ? (
          <HanetPartnerApiBadge endpoint={endpoint} extra={endpointExtra} />
        ) : null}
        <div className={contentClassName ?? "max-w-5xl"}>{children}</div>
      </AdminPageSection>
    </AdminPageGuard>
  )
}
