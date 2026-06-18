"use client"

import { Home } from "lucide-react"
import {
  AdminEmptyState,
  AdminListPageHeader,
  AdminPageGuard,
  AdminPageSection,
} from "@ui/components/admin"

export default function DormCheckinAdminPage() {
  return (
    <AdminPageGuard>
      <AdminPageSection>
        <AdminListPageHeader
          title="Check-in ký túc xá"
          subtitle="Theo dõi check-in / check-out sinh viên tại ký túc xá HUB."
          icon={Home}
        />
        <AdminEmptyState
          icon={<Home className="text-primary" aria-hidden />}
          title="Module đang được triển khai"
          description="Trang quản trị check-in ký túc xá sẽ sớm kết nối camera, danh sách lưu trú và lịch sử ra/vào."
          hints={[
            "Cấu hình camera và màn hình tại nhóm Camera & Màn hình nếu cần hiển thị tại cổng ký túc xá.",
            "Quản lý sự kiện check-in tương tự tại nhóm Sự kiện & Check-in.",
          ]}
        />
      </AdminPageSection>
    </AdminPageGuard>
  )
}
