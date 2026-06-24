"use client"

import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle, CheckCircle2, Copy } from "lucide-react"
import { AdminDataTable } from "@ui/components/data-table"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { FieldCopyButton } from "@ui/components/field"
import { cn } from "@ui/lib/utils"
import {
  buildMissingHubConfigText,
  buildPartnerHubComparisonMarkdown,
  copyTextToClipboard,
  formatEndpointMappingLine,
  formatHubEndpointLine,
  formatPartnerEndpointLine,
  isHanetEndpointProxied,
  summarizePartnerEndpoints,
} from "../shared/hanet-partner-api-format"
import {
  HANET_PARTNER_API_BASE,
  type HanetPartnerEndpoint,
} from "../shared/hanet-postman"

type HttpMethod =
  | HanetPartnerEndpoint["partnerMethod"]
  | NonNullable<HanetPartnerEndpoint["hubMethod"]>

export type HanetPartnerApiTableRow = HanetPartnerEndpoint & {
  rowId: string
  hubConfigured: boolean
}

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-600 text-white dark:bg-emerald-700",
  POST: "bg-amber-600 text-white dark:bg-amber-700",
  PATCH: "bg-sky-600 text-white dark:bg-sky-700",
  DELETE: "bg-rose-600 text-white dark:bg-rose-700",
}

function HttpMethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={cn(
        "inline-flex w-[3.25rem] shrink-0 items-center justify-center rounded px-1 py-0.5 text-[10px] font-bold tracking-wide uppercase",
        METHOD_STYLES[method] ?? "bg-muted text-muted-foreground"
      )}
    >
      {method}
    </span>
  )
}

function HubProxyStatusBadge({ configured }: { configured: boolean }) {
  if (configured) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
      >
        <CheckCircle2 className="size-3" aria-hidden />
        Hub ✓
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100"
    >
      <AlertTriangle className="size-3" aria-hidden />
      Chưa proxy
    </Badge>
  )
}

function toTableRows(
  endpoints: readonly HanetPartnerEndpoint[]
): HanetPartnerApiTableRow[] {
  return endpoints.map((endpoint) => ({
    ...endpoint,
    rowId: `${endpoint.group}-${endpoint.partnerPath}-${endpoint.hubPath ?? "partner"}`,
    hubConfigured: isHanetEndpointProxied(endpoint),
  }))
}

function useHanetPartnerApiColumns() {
  return useMemo<ColumnDef<HanetPartnerApiTableRow>[]>(
    () => [
      {
        id: "status",
        header: "Hub",
        enableColumnFilter: false,
        size: 50,
        minSize: 50,
        cell: ({ row }) => (
          <HubProxyStatusBadge configured={row.original.hubConfigured} />
        ),
      },
      {
        accessorKey: "group",
        header: "Nhóm",
        enableColumnFilter: false,
        size: 50,
        minSize: 50,
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">{String(getValue() ?? "")}</span>
        ),
      },
      {
        id: "partner",
        header: "HANET Partner",
        enableColumnFilter: false,
        size: 300,
        minSize: 300,
        cell: ({ row }) => (
          <div className="min-w-0 space-y-1 py-0.5">
            <div className="flex min-w-0 items-start gap-2">
              <HttpMethodBadge method={row.original.partnerMethod} />
              <code className="min-w-0 flex-1 text-xs leading-snug break-all">
                {row.original.partnerPath}
              </code>
              <FieldCopyButton
                text={formatPartnerEndpointLine(row.original)}
                successMessage="Đã copy Partner API"
              />
            </div>
          </div>
        ),
      },
      {
        id: "hub",
        header: "Hub Admin",
        enableColumnFilter: false,
        size: 300,
        minSize: 300,
        cell: ({ row }) => {
          const hubLine = formatHubEndpointLine(row.original)
          if (!hubLine) {
            return (
              <span className="text-xs text-muted-foreground">
                Chưa cấu hình route Nest
              </span>
            )
          }
          const [method, ...pathParts] = hubLine.split(" ")
          const path = pathParts.join(" ")
          return (
            <div className="flex min-w-0 items-start gap-2 py-0.5">
              <HttpMethodBadge method={method as HttpMethod} />
              <code className="min-w-0 flex-1 text-xs leading-snug break-all">
                {path}
              </code>
              <FieldCopyButton
                text={hubLine}
                successMessage="Đã copy Hub API"
              />
            </div>
          )
        },
      },
      {
        id: "mapping",
        header: "Đối chiếu",
        enableColumnFilter: false,
        size: 72,
        meta: { isActionsColumn: true },
        cell: ({ row }) => (
          <FieldCopyButton
            text={formatEndpointMappingLine(row.original)}
            successMessage="Đã copy mapping"
          />
        ),
      },
    ],
    []
  )
}

function HanetPartnerApiCopyToolbar({
  endpoints,
  onlyMissing,
  onOnlyMissingChange,
  onCopied,
}: {
  endpoints: readonly HanetPartnerEndpoint[]
  onlyMissing: boolean
  onOnlyMissingChange: (value: boolean) => void
  onCopied?: (label: string) => void
}) {
  const stats = summarizePartnerEndpoints(endpoints)

  const copyAll = async () => {
    const ok = await copyTextToClipboard(
      buildPartnerHubComparisonMarkdown(endpoints)
    )
    if (ok) onCopied?.("bảng đối chiếu")
  }

  const copyMissing = async () => {
    const ok = await copyTextToClipboard(buildMissingHubConfigText(endpoints))
    if (ok) onCopied?.("API chưa có Hub")
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={onlyMissing ? "secondary" : "outline"}
        size="sm"
        className="h-9 gap-1.5"
        onClick={() => onOnlyMissingChange(!onlyMissing)}
      >
        <AlertTriangle className="size-3.5" aria-hidden />
        Chưa proxy
        {stats.missing > 0 ? (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {stats.missing}
          </Badge>
        ) : null}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        onClick={() => void copyAll()}
      >
        <Copy className="size-3.5" aria-hidden />
        Copy đối chiếu
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        disabled={stats.missing === 0}
        onClick={() => void copyMissing()}
      >
        <Copy className="size-3.5" aria-hidden />
        Copy thiếu Hub
      </Button>
    </div>
  )
}

export function HanetPartnerApiTable({
  endpoints,
  tableScope,
  onCopied,
}: {
  endpoints: readonly HanetPartnerEndpoint[]
  tableScope: string
  onCopied?: (label: string) => void
}) {
  const [onlyMissing, setOnlyMissing] = useState(false)
  const columns = useHanetPartnerApiColumns()
  const allRows = useMemo(() => toTableRows(endpoints), [endpoints])
  const data = useMemo(
    () =>
      onlyMissing ? allRows.filter((row) => !row.hubConfigured) : allRows,
    [allRows, onlyMissing]
  )

  return (
    <AdminDataTable<HanetPartnerApiTableRow>
      tableScope={tableScope}
      data={data}
      columns={columns}
      getRowId={(row) => row.rowId}
      emptyLabel={
        onlyMissing
          ? "Tất cả endpoint trên trang này đã có Hub proxy."
          : "Không có endpoint."
      }
      globalFilterPlaceholder="Tìm theo nhóm, path HANET hoặc Hub…"
      globalFilterLabel="Tìm kiếm"
      getGlobalFilterText={(row) =>
        [
          row.group,
          row.partnerMethod,
          row.partnerPath,
          row.hubMethod,
          row.hubPath,
          row.hubConfigured ? "đã proxy" : "chưa proxy",
        ]
          .filter(Boolean)
          .join(" ")
      }
      filterToolbarExtra={
        <HanetPartnerApiCopyToolbar
          endpoints={endpoints}
          onlyMissing={onlyMissing}
          onOnlyMissingChange={setOnlyMissing}
          onCopied={onCopied}
        />
      }
      clientPagination={{
        initialPageSize: 10,
        pageSizeOptions: [10, 20, 50],
        itemLabel: "endpoint",
      }}
      footer={
        <p className="text-sm text-muted-foreground">
          <code className="text-xs">{HANET_PARTNER_API_BASE}</code>
          <span className="mx-1.5">·</span>
          {onlyMissing
            ? `Đang lọc ${data.length} endpoint chưa có Hub`
            : `${endpoints.length} endpoint · copy từng dòng hoặc dùng «Copy đối chiếu»`}
        </p>
      }
    />
  )
}

export { summarizePartnerEndpoints }
