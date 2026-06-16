import { ThemeProvider } from "@ui/components/theme-provider"
import { TextSizeProvider } from "@ui/components/text-size-provider"
import { QueryProvider } from "@/providers/admin/query-provider"
import { AuthProvider } from "@/providers/admin/auth-provider"
import { ParentAdminLayoutProvider } from "@/providers/admin/parent-admin-layout"
import { AdminRuntimeBridge } from "./admin-runtime-bridge"

export default function ParentAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <TextSizeProvider>
        <QueryProvider>
          <AuthProvider>
            <AdminRuntimeBridge>
              <ParentAdminLayoutProvider>{children}</ParentAdminLayoutProvider>
            </AdminRuntimeBridge>
          </AuthProvider>
        </QueryProvider>
      </TextSizeProvider>
    </ThemeProvider>
  )
}

