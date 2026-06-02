"use client"

import { useCallback, useState } from "react"
import { Copy, Check, Link2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card"
import { Button } from "@ui/components/button"
import { buildHanetWebhookUrl } from "@/lib/hanet-webhook-url"

export type EventHanetCameraInfo = {
  checkinCameraName: string | null
  checkinCameraCode: string | null
  checkoutCameraName: string | null
  checkoutCameraCode: string | null
}

export function EventHanetConfigCard({
  eventId,
  cameras,
}: {
  eventId: string
  cameras?: EventHanetCameraInfo
}) {
  const webhookUrl = buildHanetWebhookUrl(eventId)
  const [copied, setCopied] = useState(false)

  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [webhookUrl])

  return (
    <Card className="border border-dashed border-primary/30 bg-primary/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="size-5 text-primary" />
          Cấu hình HANET
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Dán URL webhook vào{" "}
          <a
            href="https://developers.hanet.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            developers.hanet.ai
          </a>
          . Chọn camera check-in / check-out trong form sự kiện (mã ={" "}
          <code className="text-xs">deviceID</code> HANET).
        </p>
        {cameras?.checkinCameraName || cameras?.checkoutCameraName ? (
          <ul className="space-y-1 rounded-md border border-border/70 bg-background px-3 py-2 text-xs">
            <li>
              <span className="text-muted-foreground">Check-in: </span>
              {cameras.checkinCameraName ?? "—"}
              {cameras.checkinCameraCode ? (
                <span className="font-mono text-muted-foreground">
                  {" "}
                  ({cameras.checkinCameraCode})
                </span>
              ) : null}
            </li>
            <li>
              <span className="text-muted-foreground">Check-out: </span>
              {cameras.checkoutCameraName ?? "—"}
              {cameras.checkoutCameraCode ? (
                <span className="font-mono text-muted-foreground">
                  {" "}
                  ({cameras.checkoutCameraCode})
                </span>
              ) : null}
            </li>
          </ul>
        ) : (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Chưa chọn camera — mở Chỉnh sửa sự kiện → mục Camera HANET.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded-md border border-border/70 bg-background px-3 py-2 text-xs">
            {webhookUrl}
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
                <Copy className="size-3.5" /> Copy URL
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
