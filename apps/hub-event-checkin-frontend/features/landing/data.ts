import {
  CalendarDays,
  PartyPopper,
  QrCode,
  Search,
  Sparkles,
  Ticket,
  Users,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const LANDING_ROUTES = {
  home: "/",
  events: "/su-kien",
  ticketLookup: "/tra-cuu",
} as const

export const LANDING_HERO = {
  eyebrow: "Dành cho sinh viên HUB",
  title: "Sống hết mình",
  flipWords: ["Career Talk", "Hackathon", "Workshop", "Lễ hội SV", "Seminar"],
  backgroundImage: {
    src: "https://fileserver2.hub.edu.vn/IMAGES/2025/12/16/20251216103027-101020.png",
    alt: "Khuôn viên Trường Đại học Ngân hàng TP. HCM",
  },
} as const

export const LANDING_HERO_BADGES = [
  { icon: Zap, label: "Đăng ký nhanh" },
  { icon: QrCode, label: "Check-in QR" },
  { icon: Ticket, label: "Vé điện tử" },
] as const

export const LANDING_STATS = [
  { value: "200+", label: "Sự kiện mỗi năm", suffix: "" },
  { value: "20K", label: "Sinh viên HUB", suffix: "+" },
  { value: "3", label: "Bước tham gia", suffix: "" },
] as const

export const LANDING_MARQUEE_TAGS = [
  "Career Fair",
  "Orientation",
  "Club Day",
  "Fintech Talk",
  "Volunteer",
  "Sports Fest",
  "Alumni Meet",
  "Design Sprint",
  "Banking 101",
  "Startup Pitch",
] as const

export type LandingFeatureAccent = "primary" | "secondary" | "navy" | "warm"

export type LandingFeature = {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  accent: LandingFeatureAccent
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: CalendarDays,
    title: "Lịch sự kiện sống động",
    description:
      "Lọc theo trạng thái và danh mục — biết ngay sự kiện nào đang mở đăng ký, đang diễn ra hay vừa kết thúc.",
    href: LANDING_ROUTES.events,
    accent: "primary",
  },
  {
    icon: QrCode,
    title: "Check-in siêu tốc",
    description: "Quét QR tại cổng — không xếp hàng, không giấy tờ.",
    accent: "secondary",
  },
  {
    icon: PartyPopper,
    title: "Trải nghiệm sinh viên",
    description:
      "Giao lưu, networking, hoạt động ngoại khóa — mở rộng kết nối và kỹ năng ngay trên campus.",
    href: LANDING_ROUTES.events,
    accent: "warm",
  },
]

export const LANDING_STEPS = [
  {
    step: "01",
    title: "Khám phá",
    description: "Duyệt sự kiện hot, xem poster và lịch chi tiết.",
  },
  {
    step: "02",
    title: "Đăng ký",
    description: "Giữ chỗ trước khi hết slot — nhận vé điện tử ngay.",
  },
  {
    step: "03",
    title: "Check-in",
    description: "Đến sự kiện, quét QR và tận hưởng trọn vẹn.",
  },
] as const

export const LANDING_INTRO = {
  heading: "HUB Events",
  subheading: "Nơi mỗi sinh viên tìm thấy cơ hội của mình",
  body: `Tại Trường Đại học Ngân hàng TP. HCM, sự kiện không chỉ là lịch trên tường — đó là không gian để bạn gặp gỡ doanh nghiệp, thử thách bản thân trong cuộc thi, và tạo kỷ niệm cùng bạn bè. Nền tảng HUB Events giúp bạn theo dõi, đăng ký và tham gia mọi hoạt động một cách gọn gàng, hiện đại.`,
  quote: "Học tập tốt — trải nghiệm trọn vẹn",
  highlights: [
    { icon: Sparkles, text: "Sự kiện học thuật & nghề nghiệp" },
    { icon: Users, text: "Câu lạc bộ & hoạt động ngoại khóa" },
    { icon: CalendarDays, text: "Lịch cập nhật theo thời gian thực" },
  ],
}
