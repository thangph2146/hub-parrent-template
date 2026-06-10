export function safeRelativeNext(
  raw: string | null | undefined,
  fallback = "/",
): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}
