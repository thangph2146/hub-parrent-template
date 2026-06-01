import Link from "next/link"
import { CalendarDays, MapPin, Monitor, Users } from "lucide-react"
import { EventPoster } from "@/components/shared/event-poster"
import { Button } from "@ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card"
import { Text } from "@ui/components/typography"
import {
  type EventStatus,
  EVENT_STATUS_LABELS,
  type PublicEventItem,
  formatEventDate,
  getEventStatus,
} from "@/lib/public-events"

const FORMAT_LABELS: Record<number, string> = {
  0: "Offline",
  1: "Online",
  2: "Hybrid",
}

const STATUS_COLORS: Record<EventStatus, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  ongoing: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  past: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
}

type EventListCardProps = {
  event: PublicEventItem
}

export function EventListCard({ event }: EventListCardProps) {
  const status = getEventStatus(event)
  const startDate = formatEventDate(event.startDate)
  const endDate = formatEventDate(event.endDate)
  const dateRange = [startDate, endDate].filter(Boolean).join(" - ")
  return (
    <Card className="overflow-hidden rounded-lg pt-0 transition-shadow hover:shadow-md">
      <EventPoster
        poster={event.poster}
        alt={event.title}
        aspectClassName="aspect-[16/9] w-full"
        placeholderClassName="size-10 text-primary/30"
      />
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
          >
            {EVENT_STATUS_LABELS[status]}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Monitor className="size-3.5" />
            {FORMAT_LABELS[event.format] ?? "Offline"}
          </span>
        </div>
        <CardTitle className="line-clamp-2 text-lg">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description?.trim() ? (
          <Text variant="small" className="line-clamp-2 text-muted-foreground">
            {event.description}
          </Text>
        ) : null}
        {dateRange ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>{dateRange}</span>
          </div>
        ) : null}
        {event.location || event.address ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{event.location || event.address}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 pt-1">
          {event.organizer ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {event.organizer}
            </span>
          ) : (
            <span />
          )}
          <Link href={`/${event.slug ?? event.id}`} prefetch={false}>
            <Button variant="outline" size="sm" className="rounded-lg">
              Chi tiết
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
