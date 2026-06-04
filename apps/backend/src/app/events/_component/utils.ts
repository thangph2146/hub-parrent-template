import { uploadAdminImage } from "@/lib/admin-upload";

/** Trích URL string từ poster API (object `{ url }`, JSON string, hoặc URL thuần). */
export function getPosterUrlFromValue(poster: unknown): string {
  if (poster == null) return "";

  if (typeof poster === "object") {
    const record = poster as Record<string, unknown>;
    if (typeof record.url === "string") return record.url.trim();
    if (typeof record.src === "string") return record.src.trim();
    return "";
  }

  if (typeof poster !== "string") return "";

  const trimmed = poster.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (typeof parsed.url === "string") return parsed.url.trim();
      if (typeof parsed.src === "string") return parsed.src.trim();
    } catch {
      // URL thuần
    }
  }

  return trimmed;
}

/** API events lưu poster dạng JSON `{ url }` (khác posts.image là string). */
export function buildPosterPayload(
  url: string | undefined | null,
): { url: string } | null {
  const trimmed = getPosterUrlFromValue(url ?? "");
  return trimmed ? { url: trimmed } : null;
}

export function uploadEventPoster(file: File): Promise<string> {
  return uploadAdminImage(file, {
    folderPath: "events",
    isExistingFolder: true,
  });
}
