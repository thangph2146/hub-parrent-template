export type EventTimeStatus = 'upcoming' | 'ongoing' | 'past';

function toValidDate(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Trạng thái thời gian sự kiện — khớp bộ lọc public list:
 * - upcoming: startDate > now
 * - ongoing: startDate <= now && endDate >= now
 * - past: endDate < now, hoặc đã bắt đầu nhưng không có endDate
 */
export function resolveEventTimeStatus(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  now: Date = new Date(),
): EventTimeStatus {
  const start = toValidDate(startDate);
  const end = toValidDate(endDate);
  const nowMs = now.getTime();

  if (start && start.getTime() > nowMs) {
    return 'upcoming';
  }

  if (end && end.getTime() < nowMs) {
    return 'past';
  }

  if (
    start &&
    end &&
    start.getTime() <= nowMs &&
    end.getTime() >= nowMs
  ) {
    return 'ongoing';
  }

  if (start && start.getTime() <= nowMs) {
    return 'past';
  }

  return 'upcoming';
}
