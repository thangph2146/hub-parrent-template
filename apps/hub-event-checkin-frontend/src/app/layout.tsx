import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "@ui/globals.css";
import "@thangph2146/lexical-editor/styles"
import { SiteRootProviders } from "@ui/components/site";

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

export const metadata: Metadata = {
  title: {
    default: "Hệ thống Sự kiện HUB",
    template: "%s | Hệ thống Sự kiện HUB",
  },
  description:
    "Giới thiệu và quản lý sự kiện tại Trường Đại học Ngân hàng TP. HCM — đăng ký, check-in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteRootProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
          >
            Bỏ qua đến nội dung chính
          </a>
          <main id="main-content" className="flex min-h-0 flex-1 flex-col">
            {children}
          </main>
        </SiteRootProviders>
      </body>
    </html>
  );
}
