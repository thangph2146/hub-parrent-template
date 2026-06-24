"use client"

import { AdminProfilePage } from "./admin-profile-page"
import { CHECKIN_STUDENT_PROFILE_CONFIG } from "../../_config/profile-page.checkin-config"

/** Cổng sinh viên — `/student/profile`. */
export default function StudentPortalProfilePage() {
  return <AdminProfilePage config={CHECKIN_STUDENT_PROFILE_CONFIG} />
}
