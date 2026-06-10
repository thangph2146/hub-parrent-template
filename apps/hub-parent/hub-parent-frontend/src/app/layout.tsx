import type { Metadata } from "next"
import "@ui/globals.css"
import "@thangph2146/lexical-editor/styles"
import { SITE_ROOT_HTML_CLASSNAME } from "@ui/lib/site-fonts"

export const metadata: Metadata = {
  title: "Sơ đồ mã nguồn HUB Parent",
  description: "Công cụ nội bộ để khám phá cấu trúc mã nguồn hệ thống HUB Parent.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      className={SITE_ROOT_HTML_CLASSNAME}
    >
      <body
        className="flex min-h-full flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
