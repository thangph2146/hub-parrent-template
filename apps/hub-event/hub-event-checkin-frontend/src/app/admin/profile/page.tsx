import { AdminProfilePage } from "@workspace/admin-app/modules/profile/_component/admin-profile-page"

const CHECKIN_ADMIN_PROFILE_CONFIG = {
  subtitle:
    "Cập nhật tên, liên hệ, địa chỉ làm việc và mật khẩu đăng nhập BTC / quản trị sự kiện.",
} as const

export default function CheckinAdminProfilePage() {
  return <AdminProfilePage config={CHECKIN_ADMIN_PROFILE_CONFIG} />
}
