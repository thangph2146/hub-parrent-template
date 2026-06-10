"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  QrCode,
  Ticket,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import { EventPoster } from "@/components/shared/event-poster"
import {
  EVENT_STATUS_LABELS,
  formatEventDate,
  getEventStatus,
  type PublicEventItem,
} from "@/lib/public-events"
import { LANDING_ROUTES } from "./data"

type HeroProductMockupProps = {
  featuredEvent?: PublicEventItem | null
  className?: string
}

export function HeroProductMockup({
  featuredEvent = null,
  className,
}: HeroProductMockupProps) {
  const status = featuredEvent ? getEventStatus(featuredEvent) : "upcoming"
  const dateLabel = featuredEvent
    ? formatEventDate(featuredEvent.startDate)
    : "10/06/2026"
  const title =
    featuredEvent?.title ?? "Career Talk & Workshop sinh viên HUB"
  const location =
    featuredEvent?.location || featuredEvent?.address || "Campus HUB · Phòng A101"
  const eventHref = featuredEvent
    ? `/su-kien/${featuredEvent.slug ?? featuredEvent.id}`
    : LANDING_ROUTES.events

  return (
    <div className={cn("relative mx-auto w-full max-w-[520px] lg:max-w-none", className)}>
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-primary/15 blur-3xl"
        aria-hidden
      />

      <div className="relative rounded-2xl border border-white/20 bg-card shadow-2xl shadow-black/30">
        <div className="flex items-center gap-2 border-b border-border/80 px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex min-w-0 max-w-[240px] flex-1 items-center justify-center rounded-md border border-border/60 bg-background/80 px-3 py-1">
            <span className="truncate text-[11px] text-muted-foreground">
              hub.edu.vn/su-kien
            </span>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-muted/20 to-background p-4 pb-16 sm:p-5 sm:pb-[4.5rem]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Ticket className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">HUB Events</p>
                <p className="text-[10px] text-muted-foreground">Sự kiện của tôi</p>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {EVENT_STATUS_LABELS[status]}
            </Badge>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            <EventPoster
              poster={featuredEvent?.poster}
              alt={title}
              aspectClassName="aspect-[16/9] w-full"
              placeholderClassName="size-8 text-primary/25"
              showBottomGradient
              overlay={
                <Badge className="absolute top-2.5 left-2.5 rounded-full bg-primary text-[10px] text-primary-foreground">
                  Nổi bật
                </Badge>
              }
            />
            <div className="space-y-2 p-3.5 sm:p-4">
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground sm:text-base">
                {title}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5 shrink-0 text-primary" />
                  {dateLabel}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{location}</span>
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                className="mt-1 h-8 w-full rounded-lg text-xs font-semibold"
                tabIndex={-1}
                disabled
              >
                Đăng ký ngay
              </Button>
            </div>
          </div>

          <div className="hero-mockup-float absolute -bottom-3 -right-1 w-[min(100%,220px)] sm:-right-3 sm:w-[240px]">
            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-lg shadow-primary/10">
              <div className="flex items-start gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5">
                  <QrCode className="size-8 text-primary" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                    Vé điện tử
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-foreground">#HUB-2048</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <CheckCircle2 className="size-3" aria-hidden />
                    Sẵn sàng check-in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 px-4 py-2.5">
          <Link
            href={eventHref}
            className="group flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground hover:text-primary"
            prefetch={false}
          >
            <span>Xem chi tiết sự kiện trên HUB Events</span>
            <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
