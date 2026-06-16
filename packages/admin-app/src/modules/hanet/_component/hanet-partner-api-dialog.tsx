"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Layers,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/components/dialog"
import { toast } from "@ui/components/sonner"
import { cn } from "@ui/lib/utils"
import { summarizePartnerEndpoints } from "@workspace/admin-app/lib/hanet-partner-api-format"
import {
  HANET_PARTNER_API_BASE,
  HANET_POSTMAN_DOCS_URL,
  type HanetPartnerEndpoint,
} from "@workspace/admin-app/lib/hanet-postman"
import {
  HanetPartnerApiTable,
} from "./hanet-partner-api-list"

function StatCard({
  label,
  value,
  tone = "default",
  icon: Icon,
}: {
  label: string
  value: number
  tone?: "default" | "success" | "warning"
  icon: typeof Layers
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5",
        tone === "success" &&
          "border-emerald-500/30 bg-emerald-500/5",
        tone === "warning" &&
          "border-amber-500/35 bg-amber-500/8",
        tone === "default" && "border-border/60 bg-muted/20"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function HanetPartnerApiDialog({
  open,
  onOpenChange,
  endpoints,
  title = "Đối chiếu HANET ↔ Hub",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoints: readonly HanetPartnerEndpoint[]
  title?: string
}) {
  if (endpoints.length === 0) return null

  const stats = summarizePartnerEndpoints(endpoints)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-7xl flex-col gap-0 overflow-hidden p-4">
        <DialogHeader className="shrink-0 space-y-3 border-b border-border/60 bg-gradient-to-b from-muted/40 to-background px-6 py-5 text-left">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <DialogDescription className="text-sm">
                So khớp Postman Partner API với route Nest Hub Admin — xác định
                endpoint nào chưa được proxy.
              </DialogDescription>
            </div>
            <Link
              href={HANET_POSTMAN_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 text-xs font-medium text-primary shadow-sm hover:bg-muted/40"
            >
              Postman
              <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <StatCard
              label="Tổng endpoint"
              value={stats.total}
              icon={Layers}
            />
            <StatCard
              label="Đã có Hub"
              value={stats.proxied}
              tone="success"
              icon={CheckCircle2}
            />
            <StatCard
              label="Chưa cấu hình Hub"
              value={stats.missing}
              tone={stats.missing > 0 ? "warning" : "default"}
              icon={AlertTriangle}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Partner base:{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              {HANET_PARTNER_API_BASE}
            </code>
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <HanetPartnerApiTable
            endpoints={endpoints}
            tableScope="hanet-partner-api-dialog"
            onCopied={(label) =>
              toast.success(`Đã copy ${label} vào clipboard`)
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Nút mở dialog đối chiếu API — header trang HANET. */
export function HanetPartnerApiDialogTrigger({
  endpoints,
}: {
  endpoints: readonly HanetPartnerEndpoint[]
}) {
  const [open, setOpen] = useState(false)

  if (endpoints.length === 0) return null

  const stats = summarizePartnerEndpoints(endpoints)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "gap-1.5 shadow-sm",
          stats.missing > 0 &&
            "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10"
        )}
        onClick={() => setOpen(true)}
      >
        <BookOpen className="size-4 text-primary" aria-hidden />
        <span>Partner API</span>
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
          {stats.total}
        </Badge>
        {stats.missing > 0 ? (
          <Badge
            variant="outline"
            className="h-5 gap-0.5 border-amber-500/40 bg-amber-500/10 px-1.5 text-[10px] text-amber-900 dark:text-amber-100"
          >
            <AlertTriangle className="size-3" aria-hidden />
            {stats.missing} thiếu Hub
          </Badge>
        ) : null}
      </Button>
      <HanetPartnerApiDialog
        open={open}
        onOpenChange={setOpen}
        endpoints={endpoints}
      />
    </>
  )
}
