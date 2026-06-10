export const DEV_LOGIN_MANUAL_VALUE = "__none__"

export const DEV_LOGIN_FIELD_LABEL = "Tài khoản development"

export const DEV_LOGIN_FIELD_DESCRIPTION =
  "Danh sách chỉ hiện ở môi trường development. Khi chọn sẽ đăng nhập trực tiếp theo user trong database, không cần điều chỉnh hay biết mật khẩu."

export const DEV_LOGIN_LOADING_PLACEHOLDER = "Đang tải user từ database..."

export const DEV_LOGIN_SELECT_PLACEHOLDER =
  "Chọn tài khoản có sẵn trong database"

export const DEV_LOGIN_EMPTY_PLACEHOLDER =
  "Không có tài khoản phù hợp trong database (chạy pnpm db:seed)"

export const DEV_LOGIN_MANUAL_OPTION_LABEL =
  "— Nhập email/mật khẩu thủ công —"

export function isDevLoginEnabled(): boolean {
  return process.env.NODE_ENV === "development"
}
