"use client"

import type { PublicEventDetail } from "@/lib/site/public-events"
import { EventRegistrationPanel } from "./event-registration-panel"

type EventDetailRegistrationAsideProps = {
  event: PublicEventDetail
  eventPath: string
  onEventRefresh: (detail: PublicEventDetail) => void
}

export function EventDetailRegistrationAside({
  event,
  eventPath,
  onEventRefresh,
}: EventDetailRegistrationAsideProps) {
  return (
    <aside className="lg:sticky lg:top-28">
      <EventRegistrationPanel
        event={event}
        eventPath={eventPath}
        onEventRefresh={onEventRefresh}
        layout="aside"
      />
    </aside>
  )
}
