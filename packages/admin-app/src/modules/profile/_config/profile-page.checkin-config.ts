import type { AdminProfilePageConfig } from "./profile-page.types"

export const CHECKIN_STUDENT_PROFILE_CONFIG: AdminProfilePageConfig = {
  subtitle:
    "Cập nhật họ tên, liên hệ và ảnh đại diện cho cổng sự kiện sinh viên.",
  maxAvatarChanges: 1,
  profileSource: "account",
  showAddress: false,
  showChangePassword: false,
  showStudentCode: true,
  studentCodeEditable: true,
  layout: "stack",
  showAvatarUrl: false,
  contactSectionTitle: "Thông tin sinh viên",
  contactSectionDescription:
    "Cập nhật thông tin liên hệ và ảnh chân dung dùng cho check-in sự kiện. Đăng nhập qua Google — không cần đổi mật khẩu tại đây.",
  avatarAccept: "image/jpeg,image/png,.jpg,.jpeg,.png",
  avatarGuidance:
    "Ảnh chân dung JPG/PNG, khuôn mặt nhìn thẳng, tối thiểu 200×200px — dùng đăng ký khuôn mặt HANET (một lần duy nhất).",
}
