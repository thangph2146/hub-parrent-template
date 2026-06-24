"use client"

import { useCallback, useMemo, useState } from "react"
import { Check, Copy, Loader2, Pause, Play, Radio } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { toast } from "@ui/components/sonner"
import { cn } from "@ui/lib/utils"
import type { EventHanetSyncSocketPayload } from "@workspace/api-client/realtime"

export type HanetCheckinLiveBarProps = {
  liveEnabled: boolean
  onLiveEnabledChange: (enabled: boolean) => void
  lastSyncAt: Date | null
  lastPayload: EventHanetSyncSocketPayload | null
  isFetching: boolean
  pollIntervalMs?: number | null
  socketConnected?: boolean
  socketError?: boolean
  webhookLocalhost?: boolean
  webhookUrl?: string | null
  lastWebhookAt?: string | null
  webhookVerify?: boolean
  clientId?: string | null
}

function buildHanetLiveIssueReport(options: {
  webhookLocalhost?: boolean
  webhookUrl?: string | null
  lastWebhookAt?: string | null
  socketConnected?: boolean
  socketError?: boolean
  pollIntervalMs?: number | null
  webhookVerify?: boolean
  clientId?: string | null
}): string {
  const lines = [
    "[HANET check-in] Báo cáo vấn đề realtime",
    "",
    "Trạng thái:",
    `- Webhook URL Hub: ${options.webhookUrl?.trim() || "—"}`,
    `- Webhook localhost: ${options.webhookLocalhost ? "Có (HANET cloud không gọi được)" : "Không"}`,
    `- Xác thực hash webhook: ${options.webhookVerify ? "Bật" : "Tắt"}`,
    `- Client ID (developers.hanet.ai): ${options.clientId?.trim() || "—"}`,
    `- Socket admin: ${options.socketError ? "Lỗi" : options.socketConnected ? "OK" : "Chưa kết nối"}`,
    `- Poll dự phòng: ${options.pollIntervalMs ? `${Math.round(options.pollIntervalMs / 1000)}s` : "—"}`,
    `- Webhook gần nhất tới Hub: ${options.lastWebhookAt?.trim() || "Chưa có"}`,
    "",
  ]

  if (options.webhookLocalhost) {
    lines.push(
      "Vấn đề:",
      "Webhook đang trỏ localhost — HANET cloud không thể POST tới máy dev.",
      "",
      "Cách khắc phục:",
      "1. Chạy tunnel public tới API (vd. ngrok http 3002)",
      "2. .env API (apps/hub-checkin/api hoặc hub-parent/api):",
      "   API_PUBLIC_URL=https://<tunnel-host>",
      "   (có thể thêm /api — Hub tự chuẩn hóa URL webhook)",
      "3. Restart API (pnpm dev:checkin hoặc pnpm dev:parent)",
      "4. Đăng ký URL trên https://developers.hanet.ai:",
      "   https://<tunnel-host>/api/public/hanet/webhook",
      "5. Quét face → kiểm tra GET /api/admin/hanet/webhook/recent",
      "",
      "URL đăng ký mẫu:",
      "https://<API_PUBLIC_URL>/api/public/hanet/webhook",
    )
  } else if (!options.lastWebhookAt) {
    lines.push(
      "Vấn đề:",
      "Chưa thấy webhook nào tới Hub sau khi quét.",
      "",
      "Kiểm tra:",
      "1. Trên https://developers.hanet.ai — app đúng Client ID ở trên, Webhook URL khớp chính xác (HTTPS, không thừa dấu /)",
      "2. GET công khai (phải HTTP 200):",
      `   ${options.webhookUrl?.trim() || "—"}/info`,
      "3. API production reachable — HANET cloud POST từ internet tới URL webhook",
      "4. Sau khi quét: GET /api/admin/hanet/webhook/recent — log API có dòng HANET webhook ← device=...",
      "5. Nếu deploy nhiều instance API: buffer webhook in-memory theo từng pod — thử poll /webhook/recent hoặc xem log từng instance",
      "6. Poll dự phòng vẫn lấy check-in qua partner API (~3s) nếu webhook chưa tới",
    )
  } else {
    lines.push(
      "Ghi chú:",
      "Webhook đã tới Hub — nếu bảng chưa cập nhật, kiểm tra placeID và tab realtime.",
    )
  }

  return lines.join("\n")
}

export function HanetCheckinLiveBar({
  liveEnabled,
  onLiveEnabledChange,
  lastSyncAt,
  lastPayload,
  isFetching,
  pollIntervalMs,
  socketConnected,
  socketError,
  webhookLocalhost,
  webhookUrl,
  lastWebhookAt,
  webhookVerify,
  clientId,
}: HanetCheckinLiveBarProps) {
  const [copied, setCopied] = useState(false)

  const lastSummary =
    lastPayload?.summary?.trim() ||
    (lastPayload?.kind === "checkin"
      ? "Check-in mới"
      : lastPayload?.kind === "checkout"
        ? "Check-out mới"
        : null)

  const showIssueHint =
    liveEnabled && (webhookLocalhost || (!webhookLocalhost && !lastWebhookAt))

  const issueReport = useMemo(
    () =>
      buildHanetLiveIssueReport({
        webhookLocalhost,
        webhookUrl,
        lastWebhookAt,
        socketConnected,
        socketError,
        pollIntervalMs,
        webhookVerify,
        clientId,
      }),
    [
      webhookLocalhost,
      webhookUrl,
      lastWebhookAt,
      socketConnected,
      socketError,
      pollIntervalMs,
      webhookVerify,
      clientId,
    ],
  )

  const onCopyIssue = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(issueReport)
      setCopied(true)
      toast.success("Đã copy báo cáo vấn đề webhook")
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Không copy được — thử chọn và copy thủ công")
    }
  }, [issueReport])

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-card px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={cn(
              "relative flex size-2.5 shrink-0 rounded-full",
              liveEnabled ? "bg-emerald-500" : "bg-muted-foreground/40",
            )}
          >
            {liveEnabled ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            ) : null}
          </span>
          <Radio className="size-4 shrink-0 text-primary" aria-hidden />
          <span className="text-sm font-medium">Theo dõi realtime</span>
          {liveEnabled ? (
            <Badge variant="secondary" className="text-[10px]">
              Webhook · poll{" "}
              {pollIntervalMs ? `${Math.round(pollIntervalMs / 1000)}s` : "—"}
            </Badge>
          ) : null}
          {liveEnabled ? (
            <Badge
              variant={
                socketError ? "destructive" : socketConnected ? "default" : "outline"
              }
              className="text-[10px]"
            >
              Socket {socketError ? "lỗi" : socketConnected ? "OK" : "…"}
            </Badge>
          ) : null}
          {isFetching ? (
            <Loader2
              className="size-3.5 shrink-0 animate-spin text-muted-foreground"
              aria-label="Đang tải lại"
            />
          ) : null}
          {liveEnabled && lastSyncAt ? (
            <span className="truncate text-xs text-muted-foreground">
              Cập nhật {lastSyncAt.toLocaleTimeString("vi-VN")}
              {lastSummary ? ` · ${lastSummary}` : ""}
            </span>
          ) : liveEnabled ? (
            <span className="text-xs text-muted-foreground">
              {socketError
                ? "Socket chưa kết nối — cần đăng nhập admin và webhook HANET tới API."
                : "Chờ webhook HANET (1–3 giây sau khi quét)…"}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          variant={liveEnabled ? "secondary" : "default"}
          size="sm"
          className="h-8 shrink-0 text-xs"
          onClick={() => onLiveEnabledChange(!liveEnabled)}
        >
          {liveEnabled ? (
            <>
              <Pause className="size-3.5" />
              Tạm dừng
            </>
          ) : (
            <>
              <Play className="size-3.5" />
              Bật realtime
            </>
          )}
        </Button>
      </div>

      {showIssueHint ? (
        <div
          className={cn(
            "flex flex-wrap items-start justify-between gap-2 rounded-md border px-2.5 py-2",
            webhookLocalhost
              ? "border-amber-500/40 bg-amber-500/5"
              : "border-border/60 bg-muted/30",
          )}
        >
          <p
            className={cn(
              "min-w-0 flex-1 text-xs leading-relaxed",
              webhookLocalhost
                ? "text-amber-800 dark:text-amber-300"
                : "text-muted-foreground",
            )}
          >
            {webhookLocalhost ? (
              <>
                Webhook đang trỏ{" "}
                <code className="rounded bg-muted px-1">{webhookUrl || "localhost"}</code> — HANET
                cloud không gọi được. Dùng ngrok/tunnel +{" "}
                <code className="rounded bg-muted px-1">API_PUBLIC_URL</code>, rồi đăng ký URL
                trên developers.hanet.ai.
              </>
            ) : (
              <>
                Chưa thấy webhook tới Hub — đăng ký URL trên{" "}
                <a
                  href="https://developers.hanet.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  developers.hanet.ai
                </a>{" "}
                (Client ID khớp .env), rồi quét và kiểm tra{" "}
                <code className="rounded bg-muted px-1">
                  GET /admin/hanet/webhook/recent
                </code>
                . Poll dự phòng vẫn cập nhật bảng ~3s.
              </>
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 gap-1.5 px-2 text-[11px]"
            onClick={() => void onCopyIssue()}
          >
            {copied ? (
              <Check className="size-3.5 text-success" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            Copy vấn đề
          </Button>
        </div>
      ) : null}
    </div>
  )
}
