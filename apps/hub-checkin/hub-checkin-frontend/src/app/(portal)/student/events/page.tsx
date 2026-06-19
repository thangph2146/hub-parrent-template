import type { Metadata } from "next"

export { default } from "@workspace/admin-app/modules/my-registered-events/page"

export const metadata: Metadata = {
  title: "Sự kiện của tôi",
  description:
    "Quản lý các sự kiện đã đăng ký, trạng thái check-in và hủy đăng ký khi còn thời hạn.",
}
