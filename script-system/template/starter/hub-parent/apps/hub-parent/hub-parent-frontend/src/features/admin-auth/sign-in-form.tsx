"use client"

import {
  PARENT_ADMIN_HOME_PATH,
  canAccessParentAdmin,
} from "@/config/admin/parent-admin-access"
import { useClientReady } from "@/providers/admin/auth-provider"
import {
  AdminSignInForm,
  type AdminSignInFormConfig,
} from "@workspace/admin-app/modules/auth/_component/sign-in-form"

const PARENT_ADMIN_SIGN_IN_CONFIG: AdminSignInFormConfig = {
  canAccessAdmin: canAccessParentAdmin,
  homePath: PARENT_ADMIN_HOME_PATH,
  staffOnlyMessage: "Tai khoan khong co quyen truy cap cong quan tri HUB Parent.",
  staffOnlyDevMessage: "Tai khoan development khong co quyen truy cap admin.",
  staffOnlyGoogleMessage: "Tai khoan Google khong co quyen truy cap admin.",
}

export function SignInForm() {
  const clientReady = useClientReady()

  return (
    <AdminSignInForm
      config={PARENT_ADMIN_SIGN_IN_CONFIG}
      loginLock={clientReady ? { ok: true as const } : { ok: true as const }}
    />
  )
}

