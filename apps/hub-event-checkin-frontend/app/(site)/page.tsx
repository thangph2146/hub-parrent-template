import type { Metadata } from "next"
import { LandingHome } from "@/features/landing/landing-home"

export const metadata: Metadata = {
  title: "HUB Events — Sự kiện cho sinh viên",
  description:
    "Khám phá career talk, hackathon, workshop và lễ hội sinh viên tại HUB. Đăng ký nhanh, check-in QR.",
}

export default function HomePage() {
  return <LandingHome />
}
