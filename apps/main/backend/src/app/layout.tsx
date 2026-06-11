import type { Metadata } from "next"
import "@ui/globals.css"
import "@thangph2146/lexical-editor/styles"
import { createAdminMetadata, AdminRootProviders } from "@ui/components/admin"
import { SITE_ROOT_HTML_CLASSNAME } from "@ui/lib/site-fonts"
import { QueryProvider } from "@/providers/query-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { AdminRuntimeBridge } from "@/providers/admin-runtime-bridge"
import { BackendAdminLayoutProvider } from "@/providers/backend-admin-layout"

/** Fallback SSR — title/description thực tế được ghi từ settings qua `useAdminDocumentTitle`. */
export const metadata: Metadata = createAdminMetadata({
  titleDefault: "Quản trị",
  titleTemplate: "%s | Quản trị",
  description: "Cổng quản trị nội bộ.",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={SITE_ROOT_HTML_CLASSNAME}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <AdminRootProviders>
          <QueryProvider>
            <AuthProvider>
              <AdminRuntimeBridge>
                <BackendAdminLayoutProvider>
                  {children}
                </BackendAdminLayoutProvider>
              </AdminRuntimeBridge>
            </AuthProvider>
          </QueryProvider>
        </AdminRootProviders>
      </body>
    </html>
  )
}
