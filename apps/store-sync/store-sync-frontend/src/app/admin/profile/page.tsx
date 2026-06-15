import { AdminProfilePage } from "@workspace/admin-app/modules/profile/_component/admin-profile-page"

const STORE_ADMIN_PROFILE_CONFIG = {
  subtitle:
    "Cập nhật thông tin tài khoản quản trị cửa hàng B2B và mật khẩu đăng nhập.",
} as const

export default function StoreAdminProfilePage() {
  return <AdminProfilePage config={STORE_ADMIN_PROFILE_CONFIG} />
}
