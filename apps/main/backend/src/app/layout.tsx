import type { Metadata } from "next"
import { Roboto, Roboto_Mono } from "next/font/google"
import "@ui/globals.css"
import "@thangph2146/lexical-editor/styles"
import { createAdminMetadata, AdminRootProviders } from "@ui/components/admin"
import { QueryProvider } from "@/providers/query-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { BackendAdminLayoutProvider } from "@/providers/backend-admin-layout"

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  display: "swap",
})

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

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
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-background font-sans text-foreground"
        suppressHydrationWarning
      >
        <AdminRootProviders>
          <QueryProvider>
            <AuthProvider>
              <BackendAdminLayoutProvider>
                {children}
              </BackendAdminLayoutProvider>
            </AuthProvider>
          </QueryProvider>
        </AdminRootProviders>
      </body>
    </html>
  )
}
