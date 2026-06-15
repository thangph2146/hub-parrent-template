"use client"

import { MyRegisteredEventsPage } from "./_component/my-registered-events-page"
import { CHECKIN_GUEST_MY_EVENTS_CONFIG } from "./_config"

/** Cổng khách — `/guest/events`. */
export default function MyRegisteredEventsGuestPortalPage() {
  return <MyRegisteredEventsPage config={CHECKIN_GUEST_MY_EVENTS_CONFIG} />
}
