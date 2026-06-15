import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Card } from "@ui/components/card"
import { EventPoster } from "@/components/shared/event-poster"
import {
  EVENT_STATUS_LABELS,
  formatEventTimeDateLine,
  getEventLocationLabel,
  getEventStatus,
  type PublicEventItem,
} from "@/lib/site/public-events"

type EventFeaturedCardProps = {
  event: PublicEventItem
}

export function EventFeaturedCard({ event }: EventFeaturedCardProps) {
  const timeLine = formatEventTimeDateLine(event.startDate)
  const location = getEventLocationLabel(event)
  const status = getEventStatus(event)

  return (
    <Link
      href={`/su-kien/${event.slug ?? event.id}`}
      prefetch={false}
      className="group block h-full w-[min(100vw-3rem,300px)] shrink-0 sm:w-[300px] pb-8 px-4"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-border/70 pt-0 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-xl">
        <div className="relative">
          <EventPoster
            poster={event.poster}
            alt={event.title}
            aspectClassName="aspect-[4/3] w-full"
            placeholderClassName="size-12 text-muted-foreground/30"
            imageClassName="transition-transform duration-500 group-hover:scale-105"
            overlay={
              <>
                <Badge className="absolute top-3 left-3 gap-1 rounded-md bg-primary text-primary-foreground shadow-sm">
                  <Star className="size-3 fill-current" />
                  Nổi bật
                </Badge>
                <Badge
                  variant="secondary"
                  className="absolute top-3 right-3 rounded-md bg-card/95 text-foreground backdrop-blur-sm"
                >
                  {EVENT_STATUS_LABELS[status]}
                </Badge>
              </>
            }
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-base leading-snug font-bold text-foreground group-hover:text-primary">
            {event.title}
          </h3>
          {timeLine ? (
            <p className="text-sm font-semibold text-primary">{timeLine}</p>
          ) : null}
          {location ? (
            <p className="mt-auto flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
              <span className="line-clamp-2">{location}</span>
            </p>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}
