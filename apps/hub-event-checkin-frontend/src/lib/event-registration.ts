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
