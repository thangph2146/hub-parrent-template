import type { Metadata } from "next"
import { StudentProfilePage } from "@/features/student/student-profile-page"

export const metadata: Metadata = {
  title: "Hồ sơ sinh viên",
}

export default function StudentProfileRoute() {
  return <StudentProfilePage />
}
