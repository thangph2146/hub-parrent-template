import { canAccessStaffAdmin } from "@workspace/api-client"
import type { AdminSignInFormConfig } from "../_forms/sign-in-form.types"

export const MAIN_ADMIN_SIGN_IN_CONFIG: AdminSignInFormConfig = {
  canAccessAdmin: canAccessStaffAdmin,
  homePath: "/",
  staffOnlyMessage:
    "Tài khoản này chỉ dùng cho phụ huynh. Cổng quản trị cần tài khoản nội bộ của nhà trường.",
  staffOnlyDevMessage:
    "Tài khoản development này không có quyền dùng cổng quản trị.",
  staffOnlyGoogleMessage:
    "Tài khoản Google này không có quyền truy cập cổng quản trị.",
}
