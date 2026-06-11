import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
  Monitor,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { EventPoster } from "@/components/shared/event-poster"
import {
  EVENT_STATUS_LABELS,
  formatEventTimeDateLine,
  getEventLocationLabel,
  getEventStatus,
  getPosterUrl,
  type PublicEventDetail,
} from "@/lib/public-events"
import { FORMAT_LABELS } from "@/lib/registration-format"
import { cn } from "@ui/lib/utils"

const HERO_STATUS_STYLES = {
  upcoming: "bg-sky-400/25 text-white ring-sky-300/40",
  ongoing: "bg-emerald-400/25 text-white ring-emerald-300/40",
  past: "bg-white/15 text-white/90 ring-white/25",
} as const

type EventDetailHeroProps = {
  event: PublicEventDetail
}

export function EventDetailHero({ event }: EventDetailHeroProps) {
  const status = getEventStatus(event)
  const timeLine = formatEventTimeDateLine(event.startDate)
  const locationLabel = getEventLocationLabel(event)
  const hasPoster = Boolean(getPosterUrl(event.poster))

  return (
    <section className="relative overflow-hidden border-b border-border bg-secondary text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.14),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1440px] px-6 py-6 md:px-12 md:py-8">
        <nav
          className="mb-4 flex flex-wrap items-center gap-1 text-xs text-white/65 sm:text-sm"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-white">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <Link href="/su-kien" className="transition-colors hover:text-white">
            Hội nghị - Sự kiện
          </Link>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-1 font-medium text-white/90">{event.title}</span>
        </nav>

        <Link
          href="/su-kien"
          className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Quay lại danh sách
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,380px)] lg:items-start lg:gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                  HERO_STATUS_STYLES[status],
                )}
              >
                {EVENT_STATUS_LABELS[status]}
              </span>
              <Badge
                variant="secondary"
                className="border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                <Monitor className="mr-1 size-3.5" aria-hidden />
                {FORMAT_LABELS[event.format] ?? "Trực tiếp (Offline)"}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-4xl">
              {event.title}
            </h1>

            <ul className="space-y-2 text-sm sm:text-base">
              {timeLine ? (
                <li className="flex items-center gap-2 font-medium text-white/95">
                  <CalendarDays className="size-5 shrink-0 text-white/80" aria-hidden />
                  {timeLine}
                </li>
              ) : null}
              {locationLabel ? (
                <li className="flex items-start gap-2 text-white/80">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white/70" aria-hidden />
                  {locationLabel}
                </li>
              ) : null}
            </ul>
          </div>

          {hasPoster ? (
            <EventPoster
              poster={event.poster}
              alt={event.title}
              aspectClassName="aspect-[16/10] w-full"
              className="rounded-xl shadow-lg ring-2 ring-white/20"
              priority
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
