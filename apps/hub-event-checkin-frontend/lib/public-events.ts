import { DEFAULT_API_URL } from "@workspace/api-client";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  error?: string | null;
  data?: T;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

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

type PublicEventsPayload = {
  data: PublicEventItem[];
  meta: PaginationMeta;
};

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

function buildApiUrl(pathname: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(`${getApiBaseUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function fetchPublicApi<T>(
  pathname: string,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = buildApiUrl(pathname, query);
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    console.log(`[event-checkin][api] GET ${url}`);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: isDev ? "no-store" : undefined,
    next: isDev ? undefined : { revalidate: 60 },
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success || payload.data === undefined) {
    const message =
      payload?.message || payload?.error || `Request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  if (isDev) {
    console.log(`[event-checkin][api] ${response.status} ${pathname}`);
  }

  return payload.data;
}

export async function getPublicEvents(params?: {
  page?: number;
  limit?: number;
  filter?: EventTimeFilter;
  categorySlug?: string;
}) {
  return fetchPublicApi<PublicEventsPayload>("/public/events", params);
}

export async function getFeaturedPublicEvents(limit = 12) {
  return getPublicEvents({ filter: "featured", page: 1, limit });
}

export async function getPublicEventBySlug(
  slug: string,
  options?: { userId?: string | null },
) {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    const userId = options?.userId?.trim();
    if (userId) headers["X-User-Id"] = userId;

    const url = buildApiUrl(`/public/events/${encodeURIComponent(slug)}`);
    const isDev = process.env.NODE_ENV === "development";
    const response = await fetch(url, {
      headers,
      cache: isDev ? "no-store" : undefined,
      next: isDev ? undefined : { revalidate: 60 },
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<PublicEventDetail> | null;
    if (!response.ok || !payload?.success || payload.data === undefined) {
      const message =
        payload?.message || payload?.error || `Request failed: ${response.status}`;
      if (/not found/i.test(message)) return null;
      throw new Error(message);
    }
    return payload.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/not found/i.test(message)) return null;
    throw error;
  }
}

export async function getPublicEventCategories(params?: { slug?: string }) {
  return fetchPublicApi<PublicEventCategoryItem[]>("/public/event-categories", params);
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

/** Định dạng giống EventBox VLU: `07:30 - 06/06/2026` */
export function formatEventTimeDateLine(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const time = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  const day = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  return `${time} - ${day}`;
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

export function getEventStatus(event: {
  startDate?: string | null;
  endDate?: string | null;
}): EventStatus {
  const now = new Date();
  if (event.startDate && new Date(event.startDate) > now) return "upcoming";
  if (event.endDate && new Date(event.endDate) < now) return "past";
  if (event.startDate && event.endDate) return "ongoing";
  if (event.startDate && new Date(event.startDate) <= now) return "ongoing";
  return "upcoming";
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
