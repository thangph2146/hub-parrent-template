"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Copy,
  Check,
  Link2,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card"
import { Button } from "@ui/components/button"
import { Badge } from "@ui/components/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/components/collapsible"
import {
  buildHanetWebhookAutoUrl,
  buildHanetWebhookUrl,
} from "@workspace/admin-app/lib/hanet-webhook-url"
import { useAdminModulePath } from "@workspace/admin-app/runtime"
import { useHanetStatusQuery } from "../_query/use-hanet-status"

export type EventHanetCameraInfo = {
  checkinCameraName: string | null
  checkinCameraCode: string | null
  checkoutCameraName: string | null
  checkoutCameraCode: string | null
}

function CopyUrlButton({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [url])

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 rounded-md border border-border/70 bg-background px-3 py-2 text-xs break-all">
          {url}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => void copyUrl()}
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> Đã copy
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function EventHanetConfigCard({
  eventId,
  cameras,
}: {
  eventId: string
  cameras?: EventHanetCameraInfo
}) {
  const eventEditPath = useAdminModulePath("events")
  const hanetPath = useAdminModulePath("hanet")
  const { data: hanetStatus, isLoading: loadingStatus } =
    useHanetStatusQuery(eventId)

  const webhookPerEvent =
    hanetStatus?.urls.forEvent ?? buildHanetWebhookUrl(eventId)
  const webhookAuto = hanetStatus?.urls.auto ?? buildHanetWebhookAutoUrl()

  const hasCameras = Boolean(
    cameras?.checkinCameraName || cameras?.checkoutCameraName
  )

  return (
    <Collapsible defaultOpen={false} className="w-full">
      <Card className="justify-start gap-0 border border-dashed border-primary/30 bg-primary/5 py-0 shadow-sm">
        <CollapsibleTrigger className="group w-full cursor-pointer py-2 text-left transition-colors hover:bg-primary/10">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]:rotate-90"
                aria-hidden
              />
              <Link2 className="size-5 text-primary" />
              Webhook HANET
              {loadingStatus ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : hanetStatus?.configured ? (
                <Badge variant="default" className="text-[10px] font-normal">
                  OAuth đã cấu hình
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] font-normal">
                  Chưa cấu hình .env API
                </Badge>
              )}
              <a
                href="https://developers.hanet.ai/document"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-normal text-primary underline-offset-2 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Tài liệu
                <ExternalLink className="size-3" aria-hidden />
              </a>
              <span className="w-full text-xs font-normal text-muted-foreground sm:ml-auto sm:w-auto">
                {hasCameras
                  ? "Đã gắn camera HANET"
                  : "Chưa gắn camera · chọn trên form sự kiện"}
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4">
          <CardContent className="space-y-4 border-t border-primary/15 pt-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Kết nối OAuth, địa điểm, thiết bị và avatar — quản lý tập trung trên{" "}
              <Link href={`${hanetPath()}/ket-noi`} className="font-medium text-primary hover:underline">
                trang HANET
              </Link>
              .
            </p>

            <div className="space-y-1">
              <p className="font-medium text-sm">Gắn camera cho sự kiện</p>
              <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                <li>
                  <Link
                    href={eventEditPath(eventId, "edit")}
                    className="text-primary hover:underline"
                  >
                    Chỉnh sửa sự kiện
                  </Link>{" "}
                  → mục <strong>Camera HANET</strong>: chọn thiết bị check-in /
                  check-out từ danh sách HANET.
                </li>
                <li>
                  Copy URL webhook bên dưới → dán vào App trên cổng HANET.
                </li>
              </ol>
            </div>

            {hasCameras ? (
              <ul className="space-y-1 rounded-md border border-border/70 bg-background px-3 py-2 text-xs">
                <li>
                  <span className="text-muted-foreground">Check-in: </span>
                  {cameras?.checkinCameraName ?? "—"}
                  {cameras?.checkinCameraCode ? (
                    <span className="font-mono text-muted-foreground">
                      {" "}
                      (deviceID: {cameras.checkinCameraCode})
                    </span>
                  ) : null}
                </li>
                <li>
                  <span className="text-muted-foreground">Check-out: </span>
                  {cameras?.checkoutCameraName ?? "—"}
                  {cameras?.checkoutCameraCode ? (
                    <span className="font-mono text-muted-foreground">
                      {" "}
                      (deviceID: {cameras.checkoutCameraCode})
                    </span>
                  ) : null}
                </li>
              </ul>
            ) : (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Chưa chọn camera —{" "}
                <Link
                  href={eventEditPath(eventId, "edit")}
                  className="font-medium underline underline-offset-2"
                >
                  mở Chỉnh sửa sự kiện → Camera HANET
                </Link>
                .
              </p>
            )}

            <CopyUrlButton
              label="Webhook theo sự kiện (khuyến nghị)"
              url={webhookPerEvent}
            />
            <CopyUrlButton
              label="Webhook chung (tự nhận diện theo deviceID + camera đã gắn)"
              url={webhookAuto}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
