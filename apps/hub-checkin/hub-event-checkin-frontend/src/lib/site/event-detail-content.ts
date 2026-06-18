import type { SerializedEditorState } from "lexical"

type LexicalRoot = {
  root?: {
    children?: Array<{
      type?: string
      children?: Array<{ type?: string; text?: string }>
    }>
  }
}

export function isSerializedEditorState(value: unknown): value is SerializedEditorState {
  return (
    value !== null &&
    typeof value === "object" &&
    "root" in value &&
    value.root !== null &&
    typeof value.root === "object" &&
    "type" in (value.root as Record<string, unknown>) &&
    (value.root as Record<string, unknown>).type === "root"
  )
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
      (child) => child.type === "text" && (child.text?.trim() ?? "").length > 0,
    )
  })
}

export function normalizeEventContentForDisplay(value: unknown): SerializedEditorState | undefined {
  if (isSerializedEditorState(value)) return value
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    if (trimmed.startsWith("{")) {
      try {
        const parsed: unknown = JSON.parse(trimmed)
        if (isSerializedEditorState(parsed)) return parsed
      } catch {
        return undefined
      }
    }
  }
  return undefined
}

export type EventDetailContentDisplay =
  | { kind: "lexical"; value: SerializedEditorState }
  | { kind: "description"; text: string }
  | { kind: "empty" }

export function resolveEventDetailContent(
  content: unknown,
  description?: string | null,
): EventDetailContentDisplay {
  if (content != null && content !== "" && !isLexicalContentEmpty(content)) {
    const normalized = normalizeEventContentForDisplay(content)
    if (normalized) {
      return { kind: "lexical", value: normalized }
    }
  }
  const text = description?.trim()
  if (text) return { kind: "description", text }
  return { kind: "empty" }
}

export function hasEventDetailContent(content: unknown): boolean {
  return content != null && content !== "" && !isLexicalContentEmpty(content)
}
