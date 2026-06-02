import { DEFAULT_API_URL } from "@workspace/api-client";
import { readEventSession } from "./event-auth";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  error?: string | null;
  data?: T;
};

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

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

  const res = await fetch(
    `${getApiBase()}/public/events/${encodeURIComponent(eventSlug)}/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": session.id,
      },
      body: JSON.stringify(phone?.trim() ? { phone: phone.trim() } : {}),
    },
  );

  const json = (await res.json().catch(() => null)) as ApiEnvelope<RegisterEventResult> | null;

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(
      json?.message || json?.error || "Không thể đăng ký sự kiện.",
    );
  }

  return json.data;
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
