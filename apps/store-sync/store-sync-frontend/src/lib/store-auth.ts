import type { DevLoginOption, PublicAuthPayload } from "@workspace/api-client";
import type { MockSession } from "@/hooks/use-session";
import { api } from "@/lib/api";

export const STORE_SESSION_STORAGE_KEY = "storesync_session";
export const STORE_SESSION_EVENT = "storesync-session";

export function toStoreSession(user: PublicAuthPayload): MockSession {
  const isAdmin = user.roles?.some(
    (r) => r.name === "admin" || r.name === "super_admin",
  );
  return {
    id: String(user.id),
    username: user.email,
    role: isAdmin ? "admin" : "store",
    displayName: user.name ?? user.email,
  };
}

export function writeStoreSession(session: MockSession): void {
  localStorage.setItem(STORE_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(STORE_SESSION_EVENT));
}

export function patchStoreSession(
  patch: Partial<Pick<MockSession, "displayName">>,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORE_SESSION_STORAGE_KEY);
    if (!raw) return;
    const session = JSON.parse(raw) as MockSession;
    writeStoreSession({ ...session, ...patch });
  } catch {
    /* ignore */
  }
}

export async function loginStoreUser(
  email: string,
  password: string,
): Promise<MockSession> {
  const user = await api.public.loginStoreWithEmail({ email, password });
  return toStoreSession(user);
}

export async function loginStoreUserDevelopment(
  userId: string,
): Promise<MockSession> {
  const user = await api.public.loginStoreWithDevelopmentUser({ userId });
  return toStoreSession(user);
}

export async function fetchStoreDevLoginOptions(): Promise<DevLoginOption[]> {
  if (process.env.NODE_ENV !== "development") return [];
  try {
    return await api.public.fetchDevLoginOptions();
  } catch {
    return [];
  }
}
