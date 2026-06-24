"use client"

import { MyRegisteredEventsPage } from "./my-registered-events-page"
import { CHECKIN_STUDENT_MY_EVENTS_CONFIG } from "../_config/portal.config"

/** Cổng sinh viên — `/student/events`. */
export default function MyRegisteredEventsStudentPortalPage() {
  return <MyRegisteredEventsPage config={CHECKIN_STUDENT_MY_EVENTS_CONFIG} />
}
