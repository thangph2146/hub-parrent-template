import { ApiError } from "@workspace/api-client";
import { api } from "./api";
import { readEventSession } from "../portal/event-session";

/** Chỉ gửi X-User-Id khi id số nguyên dương hợp lệ — tránh 500 từ API khi session legacy. */
function resolvePublicViewerUserId(
  raw: string | number | null | undefined,
): string | null {
  if (raw == null || raw === "") return null;
  const trimmed = String(raw).trim();
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n <= 0 || String(n) !== trimmed) return null;
  return trimmed;
}

export type PublicEventItem = {
  id: string;
  title: string;
  slug: string | null;
  poster: unknown;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  checkinStart: string | null;
  checkinEnd: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  organizer: string | null;
  location: string | null;
  address: string | null;
  format: number;
  onlineLink: string | null;
  schedule: unknown;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  featuredOrder?: number;
  timeStatus?: EventStatus;
};

export type PublicViewerRegistration = {
  id: string;
  email: string;
  fullName: string;
  status: number;
  registeredAt: string | null;
};

export type PublicEventSpeaker = {
  id: string;
  name: string;
  title: string | null;
  organization: string | null;
  avatar: string | null;
  role: string | null;
  presentationTitle: string | null;
  duration: number | null;
  startTime: string | null;
  endTime: string | null;
  sortOrder: number;
};

export type PublicEventRegistrant = {
  fullName: string;
  registeredAt: string | null;
};

export type PublicEventDetail = PublicEventItem & {
  content: unknown;
  qrCode: string | null;
  allowCheckin: boolean;
  allowCheckout: boolean;
  requireFaceId: boolean;
  maxParticipants: number;
  totalRegistrations: number;
  totalCheckins: number;
  totalCheckouts: number;
  myRegistration?: PublicViewerRegistration | null;
  speakers?: PublicEventSpeaker[];
  registrants?: PublicEventRegistrant[];
};

export type PublicEventCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parentName: string | null;
  _count: { children: number };
};

type EventTimeFilter = "upcoming" | "ongoing" | "past" | "all" | "featured";

export async function getPublicEvents(params?: {
  page?: number;
  limit?: number;
  filter?: EventTimeFilter;
  categorySlug?: string;
  search?: string;
  registerable?: boolean;
}) {
  const query: Record<string, string | number | undefined> = {
    page: params?.page,
    limit: params?.limit,
    filter: params?.filter,
    categorySlug: params?.categorySlug,
    search: params?.search,
  };
  if (params?.registerable) query.registerable = "1";
  return api.public.listEvents<PublicEventItem>(query);
}

export async function getFeaturedPublicEvents(limit = 12) {
  return getPublicEvents({ filter: "featured", page: 1, limit });
}

export async function getPublicEventBySlug(
  slug: string,
  options?: { userId?: string | number | null },
) {
  try {
    const userId = resolvePublicViewerUserId(
      options?.userId ?? readEventSession()?.id ?? null,
    );
    return await api.public.getEventBySlug<PublicEventDetail>(slug, {
      headers: userId ? { "X-User-Id": userId } : undefined,
    });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    if (/not found/i.test(message) || (error instanceof ApiError && error.status === 404)) {
      return null;
    }
    throw error;
  }
}

export async function getPublicEventCategories(params?: { slug?: string }) {
  return api.public.listEventCategories<PublicEventCategoryItem>(params);
}

export function formatEventDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export type EventTimeDateParts = {
  time: string;
  date: string;
};

export function formatEventTimeDateParts(
  value?: string | null,
): EventTimeDateParts | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
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
  };
}

/** Định dạng giống EventBox VLU: `07:30 - 06/06/2026` */
export function formatEventTimeDateLine(value?: string | null) {
  const parts = formatEventTimeDateParts(value);
  if (!parts) return null;
  return `${parts.time} - ${parts.date}`;
}

export type EventScheduleDisplay =
  | { kind: "empty" }
  | { kind: "single"; time: string; date: string }
  | { kind: "same-day"; timeRange: string; date: string }
  | {
      kind: "range";
      start: EventTimeDateParts;
      end: EventTimeDateParts;
    };

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getEventScheduleDisplay(
  start?: string | null,
  end?: string | null,
): EventScheduleDisplay {
  if (!start) return { kind: "empty" };

  const startParts = formatEventTimeDateParts(start);
  if (!startParts) return { kind: "empty" };

  if (!end) {
    return {
      kind: "single",
      time: startParts.time,
      date: startParts.date,
    };
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return {
      kind: "single",
      time: startParts.time,
      date: startParts.date,
    };
  }

  if (isSameCalendarDay(startDate, endDate)) {
    const endTime = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(endDate);
    return {
      kind: "same-day",
      timeRange: `${startParts.time} – ${endTime}`,
      date: startParts.date,
    };
  }

  const endParts = formatEventTimeDateParts(end);
  if (!endParts) {
    return {
      kind: "single",
      time: startParts.time,
      date: startParts.date,
    };
  }

  return {
    kind: "range",
    start: startParts,
    end: endParts,
  };
}

export function formatEventScheduleText(
  start?: string | null,
  end?: string | null,
): string | null {
  const display = getEventScheduleDisplay(start, end);
  switch (display.kind) {
    case "empty":
      return null;
    case "single":
      return `${display.time} - ${display.date}`;
    case "same-day":
      return `${display.timeRange} · ${display.date}`;
    case "range":
      return `${display.start.time} - ${display.start.date} – ${display.end.time} - ${display.end.date}`;
  }
}

export function getEventLocationLabel(event: {
  location?: string | null;
  address?: string | null;
}) {
  const parts = [event.location, event.address].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatEventDateTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export type EventStatus = "upcoming" | "ongoing" | "past";

function parseEventInstant(value?: string | null): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Trạng thái thời gian — khớp API `timeStatus` và bộ lọc `/public/events`.
 */
export function computeEventStatus(event: {
  startDate?: string | null;
  endDate?: string | null;
}): EventStatus {
  const now = Date.now();
  const startMs = parseEventInstant(event.startDate);
  const endMs = parseEventInstant(event.endDate);

  if (startMs !== null && startMs > now) {
    return "upcoming";
  }

  if (endMs !== null && endMs < now) {
    return "past";
  }

  if (
    startMs !== null &&
    endMs !== null &&
    startMs <= now &&
    endMs >= now
  ) {
    return "ongoing";
  }

  if (startMs !== null && startMs <= now) {
    return "past";
  }

  return "upcoming";
}

export function getEventStatus(event: {
  startDate?: string | null;
  endDate?: string | null;
  timeStatus?: EventStatus | null;
}): EventStatus {
  if (event.timeStatus) {
    return event.timeStatus;
  }
  return computeEventStatus(event);
}

export function filterEventsByTimeStatus<T extends {
  startDate?: string | null;
  endDate?: string | null;
  timeStatus?: EventStatus | null;
}>(
  events: T[],
  filter: "upcoming" | "ongoing" | "past" | "all",
): T[] {
  if (filter === "all") return events;
  return events.filter((event) => getEventStatus(event) === filter);
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  past: "Đã kết thúc",
};

function unwrapPosterUrl(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.url === "string") return unwrapPosterUrl(record.url);
    if (typeof record.src === "string") return unwrapPosterUrl(record.src);
    return null;
  }
  if (typeof value !== "string") return null;
  let trimmed = value.trim();
  if (!trimmed) return null;
  for (let depth = 0; depth < 4; depth += 1) {
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) break;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === "string") {
        trimmed = parsed.trim();
        continue;
      }
      if (parsed && typeof parsed === "object") {
        const record = parsed as Record<string, unknown>;
        if (typeof record.url === "string") {
          trimmed = record.url.trim();
          continue;
        }
        if (typeof record.src === "string") {
          trimmed = record.src.trim();
          continue;
        }
      }
      break;
    } catch {
      break;
    }
  }
  return trimmed;
}

export function getPosterUrl(poster: unknown): string | null {
  return unwrapPosterUrl(poster);
}

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  ongoing: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  past: "bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400",
};
