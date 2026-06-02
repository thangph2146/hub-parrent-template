import type { LucideIcon } from "lucide-react"
import {
  CalendarDays,
  Home,
  QrCode,
  Search,
  Sparkles,
} from "lucide-react"

export const SITE_BRAND = {
  name: "HUB Events",
  tagline: "Sự kiện · Đăng ký · Check-in",
  school: "Trường Đại học Ngân hàng TP. HCM",
  description:
    "Nền tảng sự kiện chính thức của HUB — khám phá hội thảo, workshop và hoạt động sinh viên; đăng ký, check-in QR tại một nơi.",
} as const

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  description?: string
}

export const MAIN_NAV: NavItem[] = [
  {
    href: "/",
    label: "Trang chủ",
    icon: Home,
    description: "Giới thiệu HUB Events",
  },
  {
    href: "/su-kien",
    label: "Hội nghị - Sự kiện",
    icon: CalendarDays,
    description: "Danh mục & lịch sự kiện",
  }
]

export const FOOTER_EVENT_LINKS = [
  { href: "/su-kien", label: "Tất cả sự kiện" },
  { href: "/su-kien?filter=upcoming", label: "Sắp diễn ra" },
  { href: "/su-kien?filter=ongoing", label: "Đang diễn ra" },
  { href: "/su-kien?filter=past", label: "Đã kết thúc" },
] as const

export const FOOTER_RESOURCE_LINKS = [
  { href: "https://hub.edu.vn", label: "Website HUB", external: true },
] as const

export const LANDING_QUICK_ACTIONS = [
  {
    href: "/su-kien",
    label: "Khám phá sự kiện",
    description: "Xem lịch, danh mục và đăng ký",
    icon: Sparkles,
  },
  {
    href: "/su-kien",
    label: "Check-in QR",
    description: "Quét mã tại cổng sự kiện",
    icon: QrCode,
  },
] as const

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
