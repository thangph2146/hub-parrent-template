import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { EventPoster } from "@/components/shared/event-poster"
import {
  EVENT_STATUS_LABELS,
  formatEventDate,
  getEventStatus,
  type PublicEventItem,
} from "@/lib/public-events"

type EventShowcaseCardProps = {
  event: PublicEventItem
}

/** Card sự kiện đồng nhất — dùng trong lưới 1 / 2 / 3 cột (landing). */
export function EventShowcaseCard({ event }: EventShowcaseCardProps) {
  const status = getEventStatus(event)
  const dateLabel = formatEventDate(event.startDate)

  return (
    <Link
      href={`/su-kien/${event.slug ?? event.id}`}
      prefetch={false}
      className="group flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-md transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 sm:min-h-[340px]"
    >
      <EventPoster
        poster={event.poster}
        alt={event.title}
        className="w-full shrink-0"
        aspectClassName="aspect-[16/10] w-full"
        placeholderClassName="size-10 text-primary/30"
        imageClassName="transition-transform duration-500 group-hover:scale-105"
        overlay={
          <Badge className="absolute top-3 left-3 rounded-full bg-primary/95 text-primary-foreground">
            {EVENT_STATUS_LABELS[status]}
          </Badge>
        }
      />

      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg leading-snug font-bold text-foreground group-hover:text-primary">
            {event.title}
          </h3>
          {event.description?.trim() ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          ) : null}
          {dateLabel ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 shrink-0 text-primary" />
              <span className="truncate">{dateLabel}</span>
            </div>
          ) : null}
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
          Chi tiết sự kiện
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}
