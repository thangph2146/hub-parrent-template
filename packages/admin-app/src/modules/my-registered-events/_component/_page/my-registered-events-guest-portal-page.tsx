"use client"

import { MyRegisteredEventsPage } from "./my-registered-events-page"
import { CHECKIN_GUEST_MY_EVENTS_CONFIG } from "../_config/portal.config"

/** Cổng khách — `/guest/events`. */
export default function MyRegisteredEventsGuestPortalPage() {
  return <MyRegisteredEventsPage config={CHECKIN_GUEST_MY_EVENTS_CONFIG} />
}
