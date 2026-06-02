import Link from "next/link"
import { ChevronRight, MapPin } from "lucide-react"
import { EventPoster } from "@/components/shared/event-poster"
import { cn } from "@ui/lib/utils"
import {
  type PublicEventItem,
  formatEventTimeDateLine,
  getEventLocationLabel,
} from "@/lib/public-events"

type EventRowCardProps = {
  event: PublicEventItem
  compact?: boolean
  className?: string
}

export function EventRowCard({
  event,
  compact = false,
  className,
}: EventRowCardProps) {
  const timeLine = formatEventTimeDateLine(event.startDate)
  const location = getEventLocationLabel(event)
  const href = `/su-kien/${event.slug ?? event.id}`

  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "group flex gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-muted/30 sm:p-4",
        className
      )}
    >
      <EventPoster
        poster={event.poster}
        alt={event.title}
        className={cn(
          "shrink-0 rounded-md",
          compact ? "h-20 w-28" : "h-24 w-32 sm:h-28 sm:w-36"
        )}
        aspectClassName="size-full"
        placeholderClassName="size-8 text-muted-foreground/40"
        imageClassName="transition-transform group-hover:scale-105"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <h3
          className={cn(
            "leading-snug font-semibold text-foreground group-hover:text-primary",
            compact
              ? "line-clamp-2 text-sm"
              : "line-clamp-2 text-base sm:text-lg"
          )}
        >
          {event.title}
        </h3>
        {timeLine ? (
          <p
            className={cn(
              "font-medium text-primary",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {timeLine}
          </p>
        ) : null}
        {location ? (
          <p
            className={cn(
              "flex items-start gap-1 text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}
          >
            <MapPin className="mt-0.5 size-3.5 shrink-0" />
            <span className="line-clamp-2">{location}</span>
          </p>
        ) : null}
      </div>
      <ChevronRight className="mt-2 size-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}
