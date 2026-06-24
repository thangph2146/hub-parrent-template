"use client"

import {
  formatEventTimeDateParts,
  getEventScheduleDisplay,
  type EventTimeDateParts,
} from "../shared/event-display"

export function DateTimeTableCell({ value }: { value?: string | null }) {
  const parts = formatEventTimeDateParts(value)
  if (!parts) {
    return <span className="text-sm text-muted-foreground">—</span>
  }
  return (
    <div className="space-y-0.5 tabular-nums">
      <p className="text-sm font-medium leading-none">{parts.time}</p>
      <p className="text-xs leading-snug text-muted-foreground">{parts.date}</p>
    </div>
  )
}

function SchedulePoint({
  label,
  parts,
}: {
  label: string
  parts: EventTimeDateParts
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium tabular-nums leading-none">
        {parts.time}
      </p>
      <p className="text-xs tabular-nums leading-snug text-muted-foreground">
        {parts.date}
      </p>
    </div>
  )
}

export function EventScheduleTableCell({
  start,
  end,
}: {
  start?: string | null
  end?: string | null
}) {
  const display = getEventScheduleDisplay(start, end)

  if (display.kind === "empty") {
    return <span className="text-sm text-muted-foreground">—</span>
  }

  if (display.kind === "single") {
    return <DateTimeTableCell value={start} />
  }

  if (display.kind === "same-day") {
    return (
      <div className="space-y-0.5 tabular-nums">
        <p className="text-sm font-medium leading-none">{display.timeRange}</p>
        <p className="text-xs leading-snug text-muted-foreground">
          {display.date}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <SchedulePoint label="Bắt đầu" parts={display.start} />
      <SchedulePoint label="Kết thúc" parts={display.end} />
    </div>
  )
}
