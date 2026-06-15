"use client"

import { canAccessStoreAdmin } from "@/config/admin/store-admin-access"
import { STORE_ADMIN_HOME_PATH } from "@/config/admin/store-admin-access"
import { useClientReady } from "@/providers/admin/auth-provider"
import {
  AdminSignInForm,
  type AdminSignInFormConfig,
} from "@workspace/admin-app/modules/auth/_component/sign-in-form"

const STORE_ADMIN_SIGN_IN_CONFIG: AdminSignInFormConfig = {
  canAccessAdmin: canAccessStoreAdmin,
  homePath: STORE_ADMIN_HOME_PATH,
  staffOnlyMessage:
    "Tài khoản không có quyền quản trị cửa hàng (dashboard / products / orders).",
  staffOnlyDevMessage:
    "Tài khoản development không có quyền quản trị store.",
  staffOnlyGoogleMessage:
    "Tài khoản không có quyền quản trị cửa hàng B2B.",
}

export function SignInForm() {
  const clientReady = useClientReady()

  return (
    <AdminSignInForm
      config={STORE_ADMIN_SIGN_IN_CONFIG}
      loginLock={clientReady ? { ok: true as const } : { ok: true as const }}
    />
  )
}
