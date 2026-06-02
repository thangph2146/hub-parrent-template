import type { ReactNode } from "react"
import { StudentShell } from "./_component/student-shell"

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentShell>{children}</StudentShell>
}
