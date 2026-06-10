import type { Metadata } from "next"
import { Footer } from "@/components/shared/footer"
import { Header } from "@/components/shared/header"

export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Header />
      <div className="flex-1 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(167,27,41,0.08),transparent)]">
        {children}
      </div>
      <Footer />
    </>
  )
}
