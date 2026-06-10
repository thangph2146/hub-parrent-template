import { AdminRootProviders } from "@ui/components/admin"
import { QueryProvider } from "@/providers/admin/query-provider"
import { AuthProvider } from "@/providers/admin/auth-provider"
import { CheckinAdminLayoutProvider } from "@/providers/admin/checkin-admin-layout"

export default function AdminCheckinLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AdminRootProviders>
      <QueryProvider>
        <AuthProvider>
          <CheckinAdminLayoutProvider>{children}</CheckinAdminLayoutProvider>
        </AuthProvider>
      </QueryProvider>
    </AdminRootProviders>
  )
}
