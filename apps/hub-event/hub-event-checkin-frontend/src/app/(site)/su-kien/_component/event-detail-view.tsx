"use client"

import { useEffect, useState } from "react"
import type { PublicEventDetail } from "@/lib/public-events"
import { EventDetailHero } from "./event-detail-hero"
import { EventDetailNotice } from "./event-detail-notice"
import { EventDetailRegistrationAside } from "./event-detail-registration-aside"
import { EventDetailTabs } from "./event-detail-tabs"

type EventDetailViewProps = {
  event: PublicEventDetail
  eventPath: string
}

export function EventDetailView({ event, eventPath }: EventDetailViewProps) {
  const [liveEvent, setLiveEvent] = useState(event)

  useEffect(() => {
    setLiveEvent(event)
  }, [event])

  const hasDescription = Boolean(liveEvent.description?.trim())

  return (
    <>
      <EventDetailHero event={liveEvent} />

      <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-12 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start">
          <div className="min-w-0 space-y-5">
            {hasDescription ? (
              <EventDetailNotice description={liveEvent.description!.trim()} />
            ) : null}
            <EventDetailTabs event={liveEvent} />
          </div>

          <EventDetailRegistrationAside
            event={liveEvent}
            eventPath={eventPath}
            onEventRefresh={setLiveEvent}
          />
        </div>
      </div>
    </>
  )
}
