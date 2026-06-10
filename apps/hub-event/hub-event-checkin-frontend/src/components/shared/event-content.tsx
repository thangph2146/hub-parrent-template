"use client"

import { EventContentRenderer } from "./event-content-renderer"

export function EventContent({ content }: { content?: unknown | null }) {
  return <EventContentRenderer content={content} />
}
