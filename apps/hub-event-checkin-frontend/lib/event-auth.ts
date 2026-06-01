import { DEFAULT_API_URL } from "@workspace/api-client";

export type EventSessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export type DevLoginOption = {
  id: string;
  email: string;
  name: string | null;
  roleNames: string[];
  roleLabels: string[];
  description: string;
};

const STORAGE_KEY = "hub_event_session";
const SESSION_EVENT = "hub-event-session";

/** Cache cho useSyncExternalStore — getSnapshot phải trả cùng tham chiếu nếu localStorage không đổi. */
let cachedRaw: string | null | undefined;
let cachedSnapshot: EventSessionUser | null = null;

function invalidateSessionCache(): void {
  cachedRaw = undefined;
  cachedSnapshot = null;
}

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  error?: string | null;
  data?: T;
};

type AuthPayload = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

function toEventSession(data: AuthPayload): EventSessionUser {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    image: data.image,
  };
}

export function readEventSession(): EventSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;

    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = null;
      return null;
    }

    const parsed = JSON.parse(raw) as EventSessionUser;
    if (!parsed?.id || !parsed?.email) {
      cachedSnapshot = null;
      return null;
    }

    cachedSnapshot = toEventSession(parsed);
    return cachedSnapshot;
  } catch {
    cachedRaw = "";
    cachedSnapshot = null;
    return null;
  }
}

export function writeEventSession(user: EventSessionUser): void {
  const normalized = toEventSession(user);
  const serialized = JSON.stringify(normalized);
  localStorage.setItem(STORAGE_KEY, serialized);
  cachedRaw = serialized;
  cachedSnapshot = normalized;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearEventSession(): void {
  localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedSnapshot = null;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeEventSession(callback: () => void): () => void {
  const notify = () => {
    invalidateSessionCache();
    callback();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(SESSION_EVENT, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SESSION_EVENT, notify);
  };
}

async function persistLoginResponse(res: Response): Promise<EventSessionUser> {
  const json = (await res.json().catch(() => null)) as ApiEnvelope<AuthPayload> | null;

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(
      json?.message || json?.error || "Email hoặc mật khẩu không đúng.",
    );
  }

  const user = toEventSession(json.data);
  writeEventSession(user);
  return user;
}

export async function loginEventUser(
  email: string,
  password: string,
): Promise<EventSessionUser> {
  const res = await fetch(`${getApiBase()}/public/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  return persistLoginResponse(res);
}

export async function loginEventUserDevelopment(
  userId: string,
): Promise<EventSessionUser> {
  const res = await fetch(`${getApiBase()}/public/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: userId.trim() }),
  });
  return persistLoginResponse(res);
}

export async function fetchDevLoginOptions(): Promise<DevLoginOption[]> {
  if (process.env.NODE_ENV !== "development") return [];

  const res = await fetch(`${getApiBase()}/public/dev-login-options`, {
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<
    DevLoginOption[]
  > | null;

  if (!res.ok || !json?.success || !Array.isArray(json.data)) {
    return [];
  }
  return json.data;
}

export function buildLoginHref(returnPath: string): string {
  const next = encodeURIComponent(returnPath);
  return `/dang-nhap?next=${next}`;
}
