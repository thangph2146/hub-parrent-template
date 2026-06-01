import Link from "next/link"
import { ArrowRight, CalendarDays, ImageIcon, MapPin, Sparkles } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { Card } from "@ui/components/card"
import { Text } from "@ui/components/typography"
import { EventPoster } from "@/components/shared/event-poster"
import {
  EVENT_STATUS_LABELS,
  formatEventDate,
  getEventStatus,
  getPosterUrl,
  type PublicEventItem,
} from "@/lib/public-events"

type FeaturedEventSpotlightProps = {
  event: PublicEventItem | null
}

export function FeaturedEventSpotlight({ event }: FeaturedEventSpotlightProps) {
  if (!event) {
    return (
      <Card className="overflow-hidden rounded-xl border border-white/20 bg-card shadow-xl py-0">
        <div className="flex aspect-[16/10] items-center justify-center bg-muted">
          <ImageIcon className="size-10 text-muted-foreground/40" aria-hidden />
        </div>
        <div className="space-y-2 p-5">
          <Badge variant="secondary" className="w-fit rounded-md">
            <Sparkles className="size-3.5" />
            Sắp có sự kiện mới
          </Badge>
          <p className="text-lg font-semibold text-foreground">Theo dõi lịch HUB Events</p>
          <Text variant="small" className="text-muted-foreground">
            Các sự kiện sinh viên sẽ được cập nhật tại đây.
          </Text>
          <Link href="/su-kien" prefetch={false}>
            <Button variant="outline" className="mt-2 w-full rounded-lg">
              Xem lịch sự kiện
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  const status = getEventStatus(event)
  const dateLabel = formatEventDate(event.startDate)
  const hasPoster = Boolean(getPosterUrl(event.poster))

  return (
    <Card className="group overflow-hidden rounded-xl border border-white/20 bg-card shadow-xl py-0">
      <EventPoster
        poster={event.poster}
        alt={event.title}
        priority
        showBottomGradient={hasPoster}
        placeholderClassName="size-10 text-muted-foreground/40"
        imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
        overlay={
          <Badge className="absolute left-3 top-3 rounded-md bg-primary text-primary-foreground">
            {EVENT_STATUS_LABELS[status]}
          </Badge>
        }
      />
      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Sự kiện nổi bật</p>
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">{event.title}</h3>
        {dateLabel ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            {dateLabel}
          </div>
        ) : null}
        {event.location || event.address ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" />
            <span className="truncate">{event.location || event.address}</span>
          </div>
        ) : null}
        <Link href={`/${event.slug ?? event.id}`} prefetch={false}>
          <Button className="w-full rounded-lg">
            Xem chi tiết
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
