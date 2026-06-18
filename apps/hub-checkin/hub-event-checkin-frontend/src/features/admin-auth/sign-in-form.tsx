"use client"

import { canAccessCheckinAdmin } from "@/config/admin/checkin-admin-access"
import { CHECKIN_ADMIN_HOME_PATH } from "@/config/admin/checkin-admin-access"
import {
  assertCanLoginAs,
  clearOtherCheckinSessions,
} from "@/lib/portal/checkin-session-exclusive"
import { useClientReady } from "@/providers/admin/auth-provider"
import {
  AdminSignInForm,
  type AdminSignInFormConfig,
} from "@workspace/admin-app/modules/auth/_component/sign-in-form"

const CHECKIN_ADMIN_SIGN_IN_CONFIG: AdminSignInFormConfig = {
  canAccessAdmin: canAccessCheckinAdmin,
  homePath: CHECKIN_ADMIN_HOME_PATH,
  staffOnlyMessage:
    "Tài khoản không có quyền quản lý sự kiện (events:view / events:manage).",
  staffOnlyDevMessage:
    "Tài khoản development không có quyền events:view / events:manage.",
  staffOnlyGoogleMessage:
    "Tài khoản không có quyền quản lý sự kiện (events:view / events:manage).",
  supportsSessionConflict: true,
  beforePersistSession: () => assertCanLoginAs("admin"),
  onBridgePersist: () => {
    clearOtherCheckinSessions("admin")
  },
}

export function SignInForm() {
  const clientReady = useClientReady()
  const loginLock = clientReady
    ? assertCanLoginAs("admin")
    : ({ ok: true as const })

  return (
    <AdminSignInForm
      config={CHECKIN_ADMIN_SIGN_IN_CONFIG}
      loginLock={loginLock}
    />
  )
}
