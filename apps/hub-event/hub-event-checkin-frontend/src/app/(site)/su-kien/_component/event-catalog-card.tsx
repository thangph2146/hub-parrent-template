import Link from "next/link"
import { ArrowUpRight, MapPin, Monitor, Star } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Card } from "@ui/components/card"
import { EventPoster } from "@/components/shared/event-poster"
import { FORMAT_LABELS } from "@/lib/site/registration-format"
import {
  EVENT_STATUS_LABELS,
  formatEventScheduleText,
  getEventLocationLabel,
  getEventStatus,
  type PublicEventItem,
} from "@/lib/site/public-events"
import { cn } from "@ui/lib/utils"

const STATUS_STYLES = {
  upcoming: "bg-sky-500/15 text-sky-700 ring-sky-500/20",
  ongoing: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20",
  past: "bg-muted text-muted-foreground ring-border",
} as const

type EventCatalogCardProps = {
  event: PublicEventItem
  className?: string
}

export function EventCatalogCard({ event, className }: EventCatalogCardProps) {
  const href = `/su-kien/${event.slug ?? event.id}`
  const status = getEventStatus(event)
  const schedule = formatEventScheduleText(event.startDate, event.endDate)
  const location = getEventLocationLabel(event)

  return (
    <Link href={href} prefetch={false} className={cn("group block h-full", className)}>
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border/70 pt-0 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-lg group-hover:shadow-primary/10">
        <div className="relative">
          <EventPoster
            poster={event.poster}
            alt={event.title}
            aspectClassName="aspect-[16/10] w-full"
            placeholderClassName="size-12 text-muted-foreground/30"
            imageClassName="transition-transform duration-500 group-hover:scale-105"
            overlay={
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                <div className="flex flex-wrap gap-1.5">
                  {event.isFeatured ? (
                    <Badge className="gap-1 rounded-md bg-primary text-primary-foreground shadow-sm">
                      <Star className="size-3 fill-current" />
                      Nổi bật
                    </Badge>
                  ) : null}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-md ring-1 backdrop-blur-sm",
                      STATUS_STYLES[status],
                    )}
                  >
                    {EVENT_STATUS_LABELS[status]}
                  </Badge>
                </div>
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-card/90 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all group-hover:opacity-100 group-hover:text-primary">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            }
          />
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground group-hover:text-primary">
            {event.title}
          </h3>

          {event.description?.trim() ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          ) : null}

          <div className="mt-auto space-y-1.5 pt-1">
            {schedule ? (
              <p className="text-sm font-semibold text-primary tabular-nums">
                {schedule}
              </p>
            ) : null}
            {location ? (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
                <span className="line-clamp-2">{location}</span>
              </p>
            ) : null}
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Monitor className="size-3.5 shrink-0" />
              {FORMAT_LABELS[event.format] ?? "Trực tiếp (Offline)"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
