/**
 * Tài khoản dev cho HUB Events Check-in — tạo bằng `pnpm db:demo` (root monorepo).
 * Mật khẩu chung local: `demo` (xem `DEV_LOGIN_PASSWORD_PLAIN` trong superadmin-bootstrap.data.ts).
 */
export type DevDemoAccount = {
  label: string
  description: string
  email: string
  password: string
  /** Cổng đăng nhập gợi ý */
  portal: "admin" | "student" | "guest"
}

export const DEV_LOGIN_PASSWORD = "demo"

export const CHECKIN_DEV_DEMO_ACCOUNTS: readonly DevDemoAccount[] = [
  {
    label: "Siêu quản trị",
    description: "Toàn quyền — cổng /admin-checkin-su-kien",
    email: "superadmin@hub.edu.vn",
    password: DEV_LOGIN_PASSWORD,
    portal: "admin",
  },
  {
    label: "BTC Check-in",
    description: "Ban tổ chức sự kiện (role event_staff)",
    email: "btc.checkin@hub.edu.vn",
    password: DEV_LOGIN_PASSWORD,
    portal: "admin",
  },
  {
    label: "Sinh viên demo",
    description: "Đăng ký & check-in QR — email @st.buh.edu.vn",
    email: "demo.sv@st.buh.edu.vn",
    password: DEV_LOGIN_PASSWORD,
    portal: "student",
  },
  {
    label: "Khách demo",
    description: "Cổng khách — sự kiện công khai",
    email: "demo.khach@hub.edu.vn",
    password: DEV_LOGIN_PASSWORD,
    portal: "guest",
  },
] as const

/** @deprecated Dùng `CHECKIN_DEV_DEMO_ACCOUNTS` */
export const DEV_DEMO_ACCOUNTS = CHECKIN_DEV_DEMO_ACCOUNTS

export function isDevDemoLoginEnabled(): boolean {
  return process.env.NODE_ENV === "development"
}
