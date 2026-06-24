"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Globe,
  KeyRound,
  Loader2,
  MapPin,
  PlugZap,
  UserCircle2,
  XCircle,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import {
  FieldSectionDivider,
  FieldSectionField,
  FieldSectionLegend,
  FieldSet,
  FieldSetContent,
} from "@ui/components/field"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { cn } from "@ui/lib/utils"
import { HanetJsonPreview, HanetModuleShell, HANET_PAGE_ENDPOINTS } from "../shared"
import { useHanetStatusQuery } from "../queries"
import { useAdminApi } from "@workspace/admin-app/runtime"

function StatusPill({
  ok,
  label,
}: {
  ok: boolean
  label: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
        ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          : "border-border bg-muted/40 text-muted-foreground"
      )}
    >
      {ok ? (
        <CheckCircle2 className="size-3 shrink-0" aria-hidden />
      ) : (
        <XCircle className="size-3 shrink-0 opacity-60" aria-hidden />
      )}
      {label}
    </span>
  )
}

function ProfilePanel({ data }: { data: unknown }) {
  const record =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null

  const email =
    typeof record?.email === "string" ? record.email.trim() : ""
  const name = typeof record?.name === "string" ? record.name.trim() : ""
  const id =
    record?.id != null && String(record.id).trim()
      ? String(record.id)
      : ""

  if (!email && !name && !id) {
    return <HanetJsonPreview data={data} />
  }

  return (
    <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserCircle2 className="size-5" aria-hidden />
      </div>
      <dl className="min-w-0 flex-1 space-y-0.5 text-sm">
        <dt className="sr-only">Tên</dt>
        <dd className="font-medium leading-tight">
          {name || (email || "Partner account")}
        </dd>
        {email && name ? (
          <>
            <dt className="sr-only">Email</dt>
            <dd className="truncate text-xs text-muted-foreground">{email}</dd>
          </>
        ) : null}
        {id ? (
          <>
            <dt className="sr-only">ID</dt>
            <dd>
              <code className="text-[10px] text-muted-foreground">id: {id}</code>
            </dd>
          </>
        ) : null}
      </dl>
    </div>
  )
}

function KetNoiContent() {
  const api = useAdminApi()
  const { data: hanetStatus, isLoading: statusLoading } = useHanetStatusQuery()
  const [profileEnabled, setProfileEnabled] = useState(false)

  const profileQuery = useQuery({
    queryKey: ["hanet", "profile"],
    queryFn: () => api.hanet.getProfile(),
    enabled: profileEnabled && hanetStatus?.configured === true,
  })

  const oauthMutation = useAdminMutation({
    mutationKey: ["hanet", "test-connection"],
    mutationFn: () => api.hanet.testConnection(),
    toast: {
      loading: "Đang kiểm tra OAuth…",
      success: (res) => res.message,
      error: (err) =>
        err instanceof Error ? err.message : "OAuth HANET thất bại",
    },
  })

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang tải…
      </div>
    )
  }

  const configured = hanetStatus?.configured === true

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FieldSet variant="section">
        <FieldSectionLegend
          icon={PlugZap}
          title="OAuth & .env API"
          description="Client ID, token và partner base URL."
          badge={
            configured ? (
              <Badge className="h-5 text-[10px]">Sẵn sàng</Badge>
            ) : (
              <Badge variant="outline" className="h-5 text-[10px]">
                Chưa cấu hình
              </Badge>
            )
          }
        />
        <FieldSetContent variant="section" className="space-y-4 pt-0">
          {configured && hanetStatus ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                <StatusPill ok={configured} label="OAuth" />
                <StatusPill
                  ok={hanetStatus.hasAccessToken}
                  label="Access token"
                />
                <StatusPill
                  ok={hanetStatus.hasRefreshToken}
                  label="Refresh token"
                />
              </div>

              <div className="space-y-3">
                <FieldSectionField
                  label="API base"
                  icon={Globe}
                  copyable
                  copyText={hanetStatus.apiBaseUrl}
                >
                  <code className="font-mono text-xs break-all">
                    {hanetStatus.apiBaseUrl}
                  </code>
                </FieldSectionField>
                {hanetStatus.clientId ? (
                  <FieldSectionField
                    label="Client ID"
                    icon={KeyRound}
                    copyable
                    copyText={hanetStatus.clientId}
                  >
                    <code className="font-mono text-xs break-all">
                      {hanetStatus.clientId}
                    </code>
                  </FieldSectionField>
                ) : null}
                {hanetStatus.defaultPlaceId ? (
                  <FieldSectionField
                    label="Place mặc định"
                    icon={MapPin}
                    copyable
                    copyText={hanetStatus.defaultPlaceId}
                  >
                    <code className="font-mono text-xs break-all">
                      {hanetStatus.defaultPlaceId}
                    </code>
                  </FieldSectionField>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
              Đặt <code className="text-[10px]">HANET_CLIENT_ID</code>,{" "}
              <code className="text-[10px]">HANET_CLIENT_SECRET</code>,{" "}
              <code className="text-[10px]">HANET_REFRESH_TOKEN</code> trong{" "}
              <code className="text-[10px]">.env</code> API.
            </p>
          )}

          <FieldSectionDivider />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 gap-1.5"
              disabled={!configured || oauthMutation.isPending}
              onClick={() => oauthMutation.mutate()}
            >
              {oauthMutation.isPending ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
              ) : (
                <PlugZap className="size-3.5 shrink-0" />
              )}
              <span className="leading-none">Test OAuth</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              disabled={!configured || profileQuery.isFetching}
              onClick={() => setProfileEnabled(true)}
            >
              {profileQuery.isFetching ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
              ) : (
                <UserCircle2 className="size-3.5 shrink-0" />
              )}
              <span className="leading-none">getProfile</span>
            </Button>
          </div>
        </FieldSetContent>
      </FieldSet>

      <FieldSet variant="section">
        <FieldSectionLegend
          icon={UserCircle2}
          title="Partner profile"
          description="Kết quả /profile/getProfile"
        />
        <FieldSetContent variant="section" className="pt-0">
          {profileQuery.isFetching ? (
            <div className="flex min-h-[8rem] items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang gọi API…
            </div>
          ) : profileQuery.data ? (
            <FieldSectionField
              label="Tài khoản partner"
              icon={Globe}
              copyable
              copyText={
                typeof (profileQuery.data as { email?: string })?.email ===
                "string"
                  ? (profileQuery.data as { email: string }).email
                  : undefined
              }
            >
              <ProfilePanel data={profileQuery.data} />
            </FieldSectionField>
          ) : profileQuery.error ? (
            <p className="text-sm text-destructive">{profileQuery.error.message}</p>
          ) : (
            <FieldSectionField label="Chưa tải" icon={KeyRound}>
              <p className="text-xs text-muted-foreground">
                Bấm <strong className="font-medium">getProfile</strong> ở cột
                trái để kiểm tra tài khoản partner.
              </p>
            </FieldSectionField>
          )}
        </FieldSetContent>
      </FieldSet>
    </div>
  )
}

export default function HanetKetNoiPage() {
  return (
    <HanetModuleShell
      icon={PlugZap}
      title="Kết nối HANET"
      subtitle="Kiểm tra OAuth và profile partner."
      endpoints={HANET_PAGE_ENDPOINTS.ketNoi}
    >
      <KetNoiContent />
    </HanetModuleShell>
  )
}
