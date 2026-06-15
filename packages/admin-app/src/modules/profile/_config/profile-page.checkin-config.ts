import type { AdminProfilePageConfig } from "./profile-page.types"

export const MAIN_ADMIN_PROFILE_CONFIG: AdminProfilePageConfig = {
  subtitle:
    "Cập nhật tên, liên hệ, địa chỉ làm việc và mật khẩu đăng nhập admin.",
}

export const CHECKIN_STUDENT_PROFILE_CONFIG: AdminProfilePageConfig = {
  subtitle:
    "Cập nhật tên, liên hệ, địa chỉ và mật khẩu cho cổng sự kiện sinh viên.",
  maxAvatarChanges: 1,
  profileSource: "account",
}
