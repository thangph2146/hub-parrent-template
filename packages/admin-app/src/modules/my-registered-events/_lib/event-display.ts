export type EventTimeDateParts = {
  time: string
  date: string
}

export type EventScheduleDisplay =
  | { kind: "empty" }
  | { kind: "single"; time: string; date: string }
  | { kind: "same-day"; timeRange: string; date: string }
  | {
      kind: "range"
      start: EventTimeDateParts
      end: EventTimeDateParts
    }

export type EventStatus = "upcoming" | "ongoing" | "past"

export function formatEventDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatEventTimeDateParts(
  value?: string | null,
): EventTimeDateParts | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return {
    time: new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date),
    date: new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
  }
}

export function formatEventTimeDateLine(value?: string | null) {
  const parts = formatEventTimeDateParts(value)
  if (!parts) return null
  return `${parts.time} - ${parts.date}`
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getEventScheduleDisplay(
  start?: string | null,
  end?: string | null,
): EventScheduleDisplay {
  if (!start) return { kind: "empty" }

  const startParts = formatEventTimeDateParts(start)
  if (!startParts) return { kind: "empty" }

  if (!end) {
    return {
      kind: "single",
      time: startParts.time,
      date: startParts.date,
    }
  }

  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return {
      kind: "single",
      time: startParts.time,
      date: startParts.date,
    }
  }

  if (isSameCalendarDay(startDate, endDate)) {
    const endTime = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(endDate)
    return {
      kind: "same-day",
      timeRange: `${startParts.time} – ${endTime}`,
      date: startParts.date,
    }
  }

  const endParts = formatEventTimeDateParts(end)
  if (!endParts) {
    return {
      kind: "single",
      time: startParts.time,
      date: startParts.date,
    }
  }

  return {
    kind: "range",
    start: startParts,
    end: endParts,
  }
}

export function formatEventScheduleText(
  start?: string | null,
  end?: string | null,
): string | null {
  const display = getEventScheduleDisplay(start, end)
  switch (display.kind) {
    case "empty":
      return null
    case "single":
      return `${display.time} - ${display.date}`
    case "same-day":
      return `${display.timeRange} · ${display.date}`
    case "range":
      return `${display.start.time} - ${display.start.date} – ${display.end.time} - ${display.end.date}`
  }
}

export function getEventLocationLabel(event: {
  location?: string | null
  address?: string | null
}) {
  const parts = [event.location, event.address].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}

export function formatEventDateTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function parseEventInstant(value?: string | null): number | null {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? null : ms
}

export function computeEventStatus(event: {
  startDate?: string | null
  endDate?: string | null
}): EventStatus {
  const now = Date.now()
  const startMs = parseEventInstant(event.startDate)
  const endMs = parseEventInstant(event.endDate)

  if (startMs !== null && startMs > now) {
    return "upcoming"
  }

  if (endMs !== null && endMs < now) {
    return "past"
  }

  if (
    startMs !== null &&
    endMs !== null &&
    startMs <= now &&
    endMs >= now
  ) {
    return "ongoing"
  }

  if (startMs !== null && startMs <= now) {
    return "past"
  }

  return "upcoming"
}

function unwrapPosterUrl(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    if (typeof record.url === "string") return unwrapPosterUrl(record.url)
    if (typeof record.src === "string") return unwrapPosterUrl(record.src)
    return null
  }
  if (typeof value !== "string") return null
  let trimmed = value.trim()
  if (!trimmed) return null
  for (let depth = 0; depth < 4; depth += 1) {
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) break
    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (typeof parsed === "string") {
        trimmed = parsed.trim()
        continue
      }
      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>
        if (typeof record.url === "string") {
          trimmed = record.url.trim()
          continue
        }
        if (typeof record.src === "string") {
          trimmed = record.src.trim()
          continue
        }
      }
      break
    } catch {
      break
    }
  }
  return trimmed
}

export function getPosterUrl(poster: unknown): string | null {
  return unwrapPosterUrl(poster)
}
