import type { Metadata } from "next"
import { StudentProfilePage } from "./_component/student-profile-page"

export const metadata: Metadata = {
  title: "Hồ sơ sinh viên",
}

export default function StudentProfileRoute() {
  return <StudentProfilePage />
}
