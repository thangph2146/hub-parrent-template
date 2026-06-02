import type { ReactNode } from "react"
import { StudentPortalLayoutProvider } from "@/providers/student-portal-layout"

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentPortalLayoutProvider>{children}</StudentPortalLayoutProvider>
}
