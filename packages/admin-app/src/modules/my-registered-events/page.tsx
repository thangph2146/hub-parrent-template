"use client"

import { MyRegisteredEventsPage } from "./_component/my-registered-events-page"
import { CHECKIN_STUDENT_MY_EVENTS_CONFIG } from "./_config"

/** Cổng sinh viên — `/student/events`. */
export default function MyRegisteredEventsStudentPortalPage() {
  return <MyRegisteredEventsPage config={CHECKIN_STUDENT_MY_EVENTS_CONFIG} />
}
