"use client"

import { AdminProfilePage } from "@workspace/admin-app/modules/profile/_component/admin-profile-page"
import { CHECKIN_STUDENT_PROFILE_CONFIG } from "@workspace/admin-app/modules/profile/_config/profile-page.checkin-config"

/** Cổng sinh viên — `/student/profile`. */
export default function StudentPortalProfilePage() {
  return <AdminProfilePage config={CHECKIN_STUDENT_PROFILE_CONFIG} />
}
