"use client"

import dynamic from "next/dynamic"
import { resolveEventDetailContent } from "@/lib/event-detail-content"

const LexicalEditor = dynamic(
  () =>
    import("@thangph2146/lexical-editor").then((mod) => ({
      default: mod.LexicalEditor,
    })),
  { ssr: false },
)

type EventContentProps = {
  content?: unknown | null
  description?: string | null
}

export function EventContent({ content, description }: EventContentProps) {
  const display = resolveEventDetailContent(content, description)

  if (display.kind === "lexical") {
    return (
      <LexicalEditor
        value={display.value}
        readOnly
        className="mx-auto max-w-none px-4 py-5 sm:px-6 sm:py-6 [&_.editor-root-container]:shadow-none [&_.editor-root-container]:ring-0"
      />
    )
  }

  if (display.kind === "description") {
    return (
      <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
        {display.text}
      </p>
    )
  }

  return null
}
