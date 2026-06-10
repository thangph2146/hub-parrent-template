import { uploadAdminImage } from "@/lib/admin/admin-upload"
import { normalizeContentForEditor } from "../posts/_component"

type LexicalRoot = {
  root?: {
    children?: Array<{
      type?: string
      children?: Array<{ type?: string; text?: string }>
    }>
  }
}

export function isLexicalContentEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return true
    try {
      return isLexicalContentEmpty(JSON.parse(trimmed))
    } catch {
      return false
    }
  }
  if (typeof value !== "object") return true

  const children = (value as LexicalRoot).root?.children
  if (!children?.length) return true

  return children.every((node) => {
    if (node?.type !== "paragraph") return false
    return !node.children?.some(
      (child) =>
        child.type === "text" && (child.text?.trim() ?? "").length > 0
    )
  })
}

export type EventDetailContentDisplay =
  | { kind: "lexical"; value: ReturnType<typeof normalizeContentForEditor> }
  | { kind: "description"; text: string }
  | { kind: "empty" }

export function resolveEventDetailContent(
  content: unknown,
  description: string | null | undefined
): EventDetailContentDisplay {
  if (content != null && content !== "" && !isLexicalContentEmpty(content)) {
    return { kind: "lexical", value: normalizeContentForEditor(content) }
  }
  const text = description?.trim()
  if (text) return { kind: "description", text }
  return { kind: "empty" }
}

/** Trích URL string từ poster API (object `{ url }`, JSON string, hoặc URL thuần). */
export function getPosterUrlFromValue(poster: unknown): string {
  if (poster == null) return ""

  if (typeof poster === "object") {
    const record = poster as Record<string, unknown>
    if (typeof record.url === "string") return record.url.trim()
    if (typeof record.src === "string") return record.src.trim()
    return ""
  }

  if (typeof poster !== "string") return ""

  const trimmed = poster.trim()
  if (!trimmed) return ""

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>
      if (typeof parsed.url === "string") return parsed.url.trim()
      if (typeof parsed.src === "string") return parsed.src.trim()
    } catch {
      // URL thuần
    }
  }

  return trimmed
}

/** API events lưu poster dạng JSON `{ url }` (khác posts.image là string). */
export function buildPosterPayload(
  url: string | undefined | null
): { url: string } | null {
  const trimmed = getPosterUrlFromValue(url ?? "")
  return trimmed ? { url: trimmed } : null
}

export function uploadEventPoster(file: File): Promise<string> {
  return uploadAdminImage(file, {
    folderPath: "events",
    isExistingFolder: true,
  })
}
