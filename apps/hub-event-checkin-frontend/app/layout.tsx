import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@ui/globals.css";
import "./globals.css";
import { TextSizeProvider } from "@ui/components/text-size-provider";
import { Toaster } from "@ui/components/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hệ thống Sự kiện HUB",
    template: "%s | Hệ thống Sự kiện HUB",
  },
  description:
    "Giới thiệu và quản lý sự kiện tại Trường Đại học Ngân hàng TP. HCM — đăng ký, check-in và tra cứu vé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TextSizeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
          >
            Bỏ qua đến nội dung chính
          </a>
          <main id="main-content" className="flex min-h-0 flex-1 flex-col">
            {children}
          </main>
          <Toaster richColors position="top-center" />
        </TextSizeProvider>
      </body>
    </html>
  );
}
