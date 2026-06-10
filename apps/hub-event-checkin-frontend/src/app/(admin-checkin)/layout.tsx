import { QueryProvider } from "@/providers/admin/query-provider"
import { AuthProvider } from "@/providers/admin/auth-provider"
import { CheckinAdminLayoutProvider } from "@/providers/admin/checkin-admin-layout"

/** Không bọc `AdminRootProviders` — root `SiteRootProviders` đã có theme + một `Toaster` top-center. */
export default function AdminCheckinLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <QueryProvider>
      <AuthProvider>
        <CheckinAdminLayoutProvider>{children}</CheckinAdminLayoutProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
