"use client"

import { Loader2, PlugZap } from "lucide-react"
import Link from "next/link"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { useAdminApi } from "@workspace/admin-app/runtime"
import { useAdminMutation } from "@ui/hooks/use-admin-mutation"
import { useHanetStatusQuery } from "../queries"

export function HanetOverviewTab() {
  const api = useAdminApi()
  const { data: hanetStatus, isLoading } = useHanetStatusQuery()

  const testMutation = useAdminMutation({
    mutationKey: ["hanet", "test-connection"],
    mutationFn: () => api.hanet.testConnection(),
    toast: {
      loading: "Đang kiểm tra OAuth HANET…",
      success: (res) => res.message,
      error: (err) =>
        err instanceof Error ? err.message : "Không kết nối được HANET",
    },
  })

  const partnerMutation = useAdminMutation({
    mutationKey: ["hanet", "test-partner"],
    mutationFn: () => api.hanet.testPartnerApi(),
    toast: {
      loading: "Đang gọi partner API…",
      success: (res) => res.message,
      error: (err) =>
        err instanceof Error ? err.message : "Partner API HANET lỗi",
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Đang tải trạng thái HANET…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">Trạng thái kết nối</span>
          {hanetStatus?.configured ? (
            <Badge variant="default">OAuth đã cấu hình</Badge>
          ) : (
            <Badge variant="outline">Chưa cấu hình .env API</Badge>
          )}
          {hanetStatus?.hasAccessToken ? (
            <Badge variant="secondary" className="text-[10px]">
              access token
            </Badge>
          ) : null}
          {hanetStatus?.hasRefreshToken ? (
            <Badge variant="secondary" className="text-[10px]">
              refresh token
            </Badge>
          ) : null}
        </div>
        {hanetStatus ? (
          <dl className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">API base</dt>
              <dd>
                <code>{hanetStatus.apiBaseUrl}</code>
              </dd>
            </div>
            {hanetStatus.clientId ? (
              <div>
                <dt className="font-medium text-foreground">Client ID</dt>
                <dd>
                  <code>{hanetStatus.clientId}</code>
                </dd>
              </div>
            ) : null}
            {hanetStatus.defaultPlaceId ? (
              <div>
                <dt className="font-medium text-foreground">Place mặc định (.env)</dt>
                <dd>
                  <code>{hanetStatus.defaultPlaceId}</code>
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="font-medium text-foreground">Webhook verify</dt>
              <dd>{hanetStatus.webhookVerify ? "Bật hash" : "Tắt"}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      {!hanetStatus?.configured ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          Đặt <code className="text-xs">HANET_CLIENT_ID</code>,{" "}
          <code className="text-xs">HANET_CLIENT_SECRET</code> và{" "}
          <code className="text-xs">HANET_REFRESH_TOKEN</code> trong{" "}
          <code className="text-xs">.env</code> API. Khuyến nghị thêm{" "}
          <code className="text-xs">HANET_DEFAULT_PLACE_ID</code>.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={testMutation.isPending}
            onClick={() => testMutation.mutate()}
          >
            {testMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PlugZap className="size-4" />
            )}
            Test OAuth
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={partnerMutation.isPending}
            onClick={() => partnerMutation.mutate()}
          >
            Test partner API
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-border/70 bg-background px-4 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Luồng tích hợp</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            Tab <strong>Địa điểm &amp; thiết bị</strong> — xem place và camera trên
            cổng HANET (deviceID).
          </li>
          <li>
            Tab <strong>Avatar</strong> — đồng bộ khuôn mặt vào{" "}
            <code className="text-[10px]">face_data</code>.
          </li>
          <li>
            Trên <strong>sự kiện</strong> — chọn camera check-in/out trực tiếp từ
            danh sách thiết bị HANET (không cần tạo camera thủ công).
          </li>
          <li>
            Webhook realtime — copy URL từ chi tiết sự kiện → App trên{" "}
            <Link
              href="https://developers.hanet.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              developers.hanet.ai
            </Link>
            .
          </li>
        </ul>
      </div>
    </div>
  )
}
