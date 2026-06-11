import type { AuthUser } from "@workspace/api-client"

export type AdminLoginResult =
  | "success"
  | "invalid_credentials"
  | "staff_only"
  | "session_conflict"
  | (string & {})

export type AdminSignInLoginLock = {
  ok: boolean
  message?: string
}

export type AdminSignInFormConfig = {
  canAccessAdmin: (user: AuthUser) => boolean
  homePath: string
  staffOnlyMessage: string
  staffOnlyDevMessage: string
  staffOnlyGoogleMessage: string
  /** Xử lý `session_conflict` (check-in). */
  supportsSessionConflict?: boolean
  /** Trước khi ghi session (bridge hash). */
  beforePersistSession?: () => AdminSignInLoginLock
  /** Sau khi validate, trước writeAdminSession (bridge). */
  onBridgePersist?: (user: AuthUser) => void
}
