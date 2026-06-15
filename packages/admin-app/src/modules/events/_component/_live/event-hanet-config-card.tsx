"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { ChevronRight, Copy, Check, Link2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card"
import { Button } from "@ui/components/button"
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
  const cameraNewPath = useAdminModulePath("cameras")
  const eventEditPath = useAdminModulePath("events")
  const webhookPerEvent = buildHanetWebhookUrl(eventId)
  const webhookAuto = buildHanetWebhookAutoUrl()
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
              Cấu hình HANET
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
                  ? "Đã gắn camera · bấm để xem webhook"
                  : "Chưa gắn camera · bấm để mở hướng dẫn"}
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="pb-4">
          <CardContent className="space-y-4 border-t border-primary/15 pt-4 text-sm">
            <div className="rounded-md border border-border/70 bg-background px-3 py-2.5 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                Yêu cầu (theo HANET)
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  Tài khoản + App trên{" "}
                  <a
                    href="https://developers.hanet.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    developers.hanet.ai
                  </a>{" "}
                  — mục Webhook, URL trả về HTTP 2xx khi POST.
                </li>
                <li>
                  API HUB public (HTTPS) — HANET gọi được từ internet; URL lấy
                  từ <code className="text-[10px]">NEXT_PUBLIC_API_URL</code>.
                </li>
                <li>
                  Mã thiết bị <code className="text-[10px]">deviceID</code> trên
                  payload = <strong>mã camera</strong> trong HUB (nhập tay khi
                  tạo camera).
                </li>
                <li>
                  Người quét phải đã <strong>đăng ký sự kiện</strong> (email /
                  mã người khớp danh sách).
                </li>
              </ul>
              <p className="mt-2 text-[11px]">
                OAuth2 (<code className="text-[10px]">client_id</code> /{" "}
                <code className="text-[10px]">access_token</code>) chỉ cần khi
                gọi HTTP API HANET — webhook realtime không bắt buộc.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium">Cấu hình tay trong HUB</p>
              <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                <li>
                  <Link
                    href={cameraNewPath("new")}
                    className="text-primary hover:underline"
                  >
                    Thêm camera
                  </Link>{" "}
                  — nhập <strong>Mã camera (deviceID HANET)</strong> đúng như
                  trên cổng HANET (có thể gắn thêm sự kiện mặc định ở camera).
                </li>
                <li>
                  <Link
                    href={eventEditPath(eventId, "edit")}
                    className="text-primary hover:underline"
                  >
                    Chỉnh sửa sự kiện
                  </Link>{" "}
                  → mục <strong>Camera HANET</strong>: chọn camera check-in /
                  check-out; bật khung giờ check-in/out.
                </li>
                <li>
                  Copy URL webhook bên dưới → dán vào App HANET (Webhook).
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
                , hoặc tạo camera trước tại menu Camera.
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
