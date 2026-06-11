import { api } from "./api";
import { readEventSession } from "./event-session";

export type RegisterEventResult = {
  id: string;
  eventId: string;
  email: string;
  fullName: string;
};

export async function registerForEvent(
  eventSlug: string,
  phone?: string,
): Promise<RegisterEventResult> {
  const session = readEventSession();
  if (!session?.id) {
    throw new Error("Vui lòng đăng nhập trước khi đăng ký.");
  }

  return api.public.registerForEvent<RegisterEventResult>(
    eventSlug,
    phone?.trim() ? { phone: phone.trim() } : {},
  );
}

export type RegistrationWindowState =
  | { open: true }
  | { open: false; reason: string };

/** Còn trong khung đăng ký (registrationStart → registrationEnd). */
export function getRegistrationPeriodState(event: {
  registrationStart?: string | null;
  registrationEnd?: string | null;
  startDate?: string | null;
}): RegistrationWindowState {
  const now = Date.now();
  const hasStart = Boolean(event.registrationStart?.trim());
  const hasEnd = Boolean(event.registrationEnd?.trim());

  if (!hasStart && !hasEnd) {
    if (event.startDate) {
      const startMs = Date.parse(event.startDate);
      if (!Number.isNaN(startMs) && now >= startMs) {
        return {
          open: false,
          reason: "Sự kiện đã bắt đầu, không thể hủy đăng ký.",
        };
      }
    }
    return { open: true };
  }

  if (hasStart) {
    const startMs = Date.parse(event.registrationStart!);
    if (!Number.isNaN(startMs) && now < startMs) {
      return { open: false, reason: "Chưa đến thời gian đăng ký." };
    }
  }

  if (hasEnd) {
    const endMs = Date.parse(event.registrationEnd!);
    if (!Number.isNaN(endMs) && now > endMs) {
      return { open: false, reason: "Đã hết thời hạn đăng ký." };
    }
  }

  return { open: true };
}

export function getRegistrationWindowState(event: {
  registrationStart?: string | null;
  registrationEnd?: string | null;
  endDate?: string | null;
  startDate?: string | null;
}): RegistrationWindowState {
  const now = Date.now();
  if (event.registrationStart) {
    const start = Date.parse(event.registrationStart);
    if (!Number.isNaN(start) && now < start) {
      return { open: false, reason: "Chưa đến thời gian mở đăng ký." };
    }
  }
  if (event.registrationEnd) {
    const end = Date.parse(event.registrationEnd);
    if (!Number.isNaN(end) && now > end) {
      return { open: false, reason: "Đã hết hạn đăng ký." };
    }
  }
  if (event.endDate) {
    const end = Date.parse(event.endDate);
    if (!Number.isNaN(end) && now > end) {
      return { open: false, reason: "Sự kiện đã kết thúc." };
    }
  }
  return { open: true };
}

/** Sự kiện đang mở đăng ký (khớp logic API đăng ký công khai). */
export function isEventRegisterable(event: {
  registrationStart?: string | null;
  registrationEnd?: string | null;
  endDate?: string | null;
}): boolean {
  return getRegistrationWindowState(event).open;
}
