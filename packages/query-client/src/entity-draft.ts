const DRAFT_PREFIX = "hub:entity-draft:";

export function buildEntityDraftKey(scope: string, entityId: string): string {
  return `${DRAFT_PREFIX}${scope}:${entityId}`;
}

export function loadEntityDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveEntityDraft<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode — bỏ qua
  }
}

export function clearEntityDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}
