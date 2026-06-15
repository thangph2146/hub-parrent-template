"use client"

import { AUTH_LOGIN_PATH } from "@/lib/admin/auth-routes"
import { AdminRegisterForm } from "@workspace/admin-app/modules/auth/_component/register-form"

export function RegisterForm() {
  return <AdminRegisterForm config={{ loginPath: AUTH_LOGIN_PATH }} />
}
