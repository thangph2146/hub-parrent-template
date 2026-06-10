import { AdminPageTransition } from "@ui/components/admin"

export default function Template({ children }: { children: React.ReactNode }) {
  return <AdminPageTransition>{children}</AdminPageTransition>
}
