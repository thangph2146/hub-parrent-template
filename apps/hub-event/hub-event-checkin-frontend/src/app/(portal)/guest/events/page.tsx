import type { Metadata } from "next"
import { MyRegisteredEventsPage } from "@/features/my-registered-events"

export const metadata: Metadata = {
  title: "Sự kiện của tôi",
  description:
    "Quản lý các sự kiện đã đăng ký, trạng thái check-in và hủy đăng ký khi còn thời hạn.",
}

export default function GuestEventsPage() {
  return <MyRegisteredEventsPage />
}
