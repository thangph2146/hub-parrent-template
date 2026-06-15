import { QueryProvider } from "@/providers/admin/query-provider"
import { AuthProvider } from "@/providers/admin/auth-provider"
import { StoreAdminLayoutProvider } from "@/providers/admin/store-admin-layout"
import { AdminRuntimeBridge } from "./admin-runtime-bridge"

export default function StoreAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AdminRuntimeBridge>
          <StoreAdminLayoutProvider>{children}</StoreAdminLayoutProvider>
        </AdminRuntimeBridge>
      </AuthProvider>
    </QueryProvider>
  )
}
