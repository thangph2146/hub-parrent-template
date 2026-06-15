import {
  CalendarDays,
  CheckCheck,
  Clock,
  Globe,
  MapPin,
  Users,
} from "lucide-react"
import { formatRange } from "@/lib/site/registration-format"
import type { PublicEventDetail } from "@/lib/site/public-events"

type EventDetailOverviewProps = {
  event: PublicEventDetail
}

export function EventDetailOverview({ event }: EventDetailOverviewProps) {
  const rows = [
    {
      icon: CalendarDays,
      label: "Thời gian sự kiện",
      value: formatRange(event.startDate, event.endDate),
      show: true,
    },
    {
      icon: CheckCheck,
      label: "Thời hạn đăng ký",
      value: formatRange(event.registrationStart, event.registrationEnd),
      show: Boolean(event.registrationStart || event.registrationEnd),
    },
    {
      icon: Clock,
      label: "Cửa sổ check-in",
      value: formatRange(event.checkinStart, event.checkinEnd),
      show: Boolean(event.checkinStart || event.checkinEnd),
    },
    {
      icon: MapPin,
      label: "Địa điểm",
      value: [event.location, event.address].filter(Boolean).join(" · "),
      show: Boolean(event.location || event.address),
    },
    {
      icon: Users,
      label: "Ban tổ chức",
      value: event.organizer,
      show: Boolean(event.organizer?.trim()),
    },
    {
      icon: Globe,
      label: "Liên kết online",
      value: event.onlineLink ? (
        <a
          href={event.onlineLink}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-primary underline-offset-4 hover:underline"
        >
          {event.onlineLink}
        </a>
      ) : null,
      show: Boolean(event.onlineLink?.trim()),
    },
  ].filter((row) => row.show)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => {
        const Icon = row.icon
        return (
          <div
            key={row.label}
            className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-4"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {row.label}
              </p>
              <div className="mt-1 text-sm font-medium leading-snug text-foreground">
                {row.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
