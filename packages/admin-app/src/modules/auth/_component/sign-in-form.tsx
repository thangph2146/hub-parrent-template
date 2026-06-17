"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@ui/components/sonner"
import { Eye, EyeOff } from "lucide-react"
import type { AuthUser } from "@workspace/api-client"
import { Button } from "@ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import {
  DevLoginAccountField,
  DEV_LOGIN_FIELD_DESCRIPTION,
  isDevLoginEnabled,
  useDevLoginOptions,
} from "@ui/components/auth"
import { cn } from "@ui/lib/utils"
import { AdminAuthDevPanel } from "./admin-auth-dev-panel"
import { AdminAuthFormSkeleton } from "./admin-auth-form-skeleton"
import { AdminAuthGoogleButton } from "./admin-auth-google-button"
import { useAdminAuthPageDisplay } from "./use-admin-auth-page-display"
import { AdminAuthFormHeader } from "./admin-auth-form-header"
import { AdminAuthFormHero } from "./admin-auth-form-hero"
import { AdminAuthSplitLayout } from "./admin-auth-split-layout"
import { useAuth, useClientReady } from "@workspace/admin-app/runtime"
import {
  fetchDevLoginOptions,
} from "@workspace/admin-app/modules/auth/_lib/auth-api"
import { useAdminLayout } from "@ui/components/admin"
import { ADMIN_SESSION_EVENT, writeAdminSession } from "@workspace/admin-app/lib/auth-session"
import { MAIN_ADMIN_SIGN_IN_CONFIG } from "../_config/sign-in-form.main-config"
import type {
  AdminLoginResult,
  AdminSignInFormConfig,
  AdminSignInLoginLock,
} from "./sign-in-form.types"

export type { AdminSignInFormConfig, AdminSignInLoginLock } from "./sign-in-form.types"
export { MAIN_ADMIN_SIGN_IN_CONFIG } from "../_config/sign-in-form.main-config"

function decodeBridgeSession(raw: string): AuthUser | null {
  try {
    const binary = window.atob(raw)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const user = JSON.parse(json) as AuthUser

    if (
      (typeof user?.id !== "string" && typeof user?.id !== "number") ||
      typeof user?.email !== "string" ||
      !(
        typeof user?.name === "string" ||
        user?.name === null ||
        user?.name === undefined
      ) ||
      !Array.isArray(user?.roles) ||
      !Array.isArray(user?.permissions)
    ) {
      return null
    }

    return user
  } catch {
    return null
  }
}

function sessionConflictMessage(
  loginLock: AdminSignInLoginLock | undefined,
): string {
  return loginLock?.ok
    ? "Đang có phiên đăng nhập khác. Hãy đăng xuất trước."
    : (loginLock?.message ??
        "Đang có phiên đăng nhập khác. Hãy đăng xuất trước.")
}

function resolveLoginFailure(
  result: AdminLoginResult | unknown,
  config: AdminSignInFormConfig,
  mode: "email" | "dev" | "google",
  loginLock?: AdminSignInLoginLock,
): string | null {
  if (result === "success") return null
  if (result === "invalid_credentials") {
    return mode === "dev"
      ? "Không thể đăng nhập bằng tài khoản development đã chọn."
      : "Sai email hoặc mật khẩu."
  }
  if (result === "staff_only") {
    if (mode === "google") return config.staffOnlyGoogleMessage
    if (mode === "dev") return config.staffOnlyDevMessage
    return config.staffOnlyMessage
  }
  if (result === "session_conflict" && config.supportsSessionConflict) {
    return sessionConflictMessage(loginLock)
  }
  if (mode === "google") return "Đăng nhập Google thất bại."
  return "Đăng nhập thất bại."
}

export function AdminSignInForm({
  config,
  loginLock,
}: {
  config: AdminSignInFormConfig
  loginLock?: AdminSignInLoginLock
}) {
  const router = useRouter()
  const { login, loginDevelopment, loginGoogle } = useAuth()
  const { loginPath, registerPath } = useAdminLayout()
  const { siteName, siteDescription, heroImageSrc, isReady: brandingReady } =
    useAdminAuthPageDisplay()
  const clientReady = useClientReady()
  const isDevelopment = isDevLoginEnabled()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [selectedDevLoginId, setSelectedDevLoginId] = useState("")
  const {
    options: devLoginOptions,
    loading: devLoginOptionsLoading,
  } = useDevLoginOptions(
    () => (clientReady ? fetchDevLoginOptions() : Promise.resolve([])),
    [clientReady],
  )
  const staffOnlyToastRef = useRef(false)
  const bridgeHandledRef = useRef(false)

  useEffect(() => {
    if (!clientReady || bridgeHandledRef.current) return
    if (typeof window === "undefined") return

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash
    if (!hash) return

    const params = new URLSearchParams(hash)
    const encodedSession = params.get("session")
    if (!encodedSession) return

    bridgeHandledRef.current = true
    const user = decodeBridgeSession(encodedSession)

    if (!user || !config.canAccessAdmin(user)) {
      toast.error("Không thể đồng bộ phiên đăng nhập quản trị.")
      router.replace(loginPath)
      return
    }

    const gate = config.beforePersistSession?.() ?? { ok: true as const }
    if (!gate.ok) {
      toast.error(gate.message ?? "Không thể đồng bộ phiên đăng nhập.")
      router.replace(loginPath)
      return
    }

    config.onBridgePersist?.(user)
    writeAdminSession(user)
    window.dispatchEvent(new Event(ADMIN_SESSION_EVENT))
    toast.success("Đã chuyển sang cổng quản trị.")
    router.replace(config.homePath)
  }, [clientReady, config, loginPath, router])

  useEffect(() => {
    if (!clientReady || staffOnlyToastRef.current) return
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search)
    if (q.get("reason") !== "staff_only") return
    staffOnlyToastRef.current = true
    toast.error(
      "Tài khoản phụ huynh không dùng được cổng quản trị nội bộ. Hãy đăng nhập ở cổng phụ huynh HUB Parent."
    )
    router.replace(loginPath)
  }, [clientReady, loginPath, router])

  const handleGoogleCredential = async (credential: string) => {
    if (!loginGoogle) {
      toast.error("Đăng nhập Google chưa sẵn sàng.")
      return
    }
    setBusy(true)
    try {
      const result = await loginGoogle(credential)
      const message = resolveLoginFailure(
        result,
        config,
        "google",
        loginLock,
      )
      if (message) {
        toast.error(message)
        return
      }
      toast.success("Đăng nhập Google thành công.")
      router.replace(config.homePath)
    } finally {
      setBusy(false)
    }
  }

  const finishLogin = async (
    result: AdminLoginResult | unknown,
    mode: "email" | "dev",
    successToast: string,
  ) => {
    const message = resolveLoginFailure(result, config, mode, loginLock)
    if (message) {
      setError(message)
      toast.error(message)
      return
    }
    toast.success(successToast)
    router.replace(config.homePath)
  }

  const runLogin = async (nextEmail: string, nextPassword: string) => {
    setError(null)
    setBusy(true)
    try {
      if (!login) {
        toast.error("Đăng nhập chưa sẵn sàng.")
        return
      }
      const result = await login(nextEmail, nextPassword)
      await finishLogin(result, "email", "Đăng nhập thành công.")
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isDevelopment && selectedDevLoginId) {
      setError(null)
      setBusy(true)
      try {
        if (!loginDevelopment) {
          toast.error("Đăng nhập development chưa sẵn sàng.")
          return
        }
        const result = await loginDevelopment(selectedDevLoginId)
        await finishLogin(
          result,
          "dev",
          "Đăng nhập development thành công.",
        )
      } finally {
        setBusy(false)
      }
      return
    }
    await runLogin(email, password)
  }

  return (
    <AdminAuthSplitLayout
      visual={
        <AdminAuthFormHero
          siteName={siteName}
          siteDescription={siteDescription}
          imageSrc={heroImageSrc}
          isReady={brandingReady}
        />
      }
    >
      <form onSubmit={onSubmit}>
        <FieldGroup className="gap-4">
          {!brandingReady ? (
            <AdminAuthFormSkeleton />
          ) : (
            <>
              {loginLock && !loginLock.ok ? (
                <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-50">
                  {loginLock.message}
                </div>
              ) : null}

              <AdminAuthFormHeader
                title="Đăng nhập hệ thống"
                siteName={siteName}
                siteDescription={siteDescription}
              />

              {isDevelopment ? (
                <AdminAuthDevPanel description={DEV_LOGIN_FIELD_DESCRIPTION}>
                  <DevLoginAccountField
                    value={selectedDevLoginId}
                    onValueChange={(value, option) => {
                      setSelectedDevLoginId(value)
                      if (!option) return
                      setEmail(option.email)
                      setPassword("")
                      setError(null)
                    }}
                    options={devLoginOptions}
                    loading={devLoginOptionsLoading}
                    disabled={busy}
                  />
                </AdminAuthDevPanel>
              ) : null}

              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => {
                    if (selectedDevLoginId) {
                      setSelectedDevLoginId("")
                    }
                    setEmail(event.target.value)
                  }}
                  required
                  disabled={busy}
                  readOnly={isDevelopment && !!selectedDevLoginId}
                  placeholder="example@email.com"
                  className={cn(
                    "h-11",
                    isDevelopment &&
                      selectedDevLoginId &&
                      "bg-muted/40 text-foreground",
                  )}
                />
                {isDevelopment && selectedDevLoginId ? (
                  <FieldDescription>
                    Email lấy từ tài khoản development đã chọn.
                  </FieldDescription>
                ) : null}
              </Field>

              {!(isDevelopment && selectedDevLoginId) ? (
                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Mật khẩu
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        if (selectedDevLoginId) {
                          setSelectedDevLoginId("")
                        }
                        setPassword(event.target.value)
                      }}
                      required
                      disabled={busy}
                      placeholder="Nhập mật khẩu của bạn"
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPassword((value) => !value)}
                      disabled={busy}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                </Field>
              ) : null}

              <Field className="pt-1">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full font-medium"
                  disabled={busy}
                >
                  {busy
                    ? isDevelopment && selectedDevLoginId
                      ? "Đang đăng nhập development..."
                      : "Đang đăng nhập..."
                    : "Đăng nhập"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc tiếp tục với
              </FieldSeparator>

              <AdminAuthGoogleButton
                disabled={busy || !clientReady}
                onCredential={handleGoogleCredential}
              />

              <FieldError>{error}</FieldError>

              <FieldDescription className="text-center text-sm">
                Nếu bạn chưa có tài khoản?{" "}
                <Link
                  href={registerPath}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Đăng ký
                </Link>
              </FieldDescription>
            </>
          )}
        </FieldGroup>
      </form>
    </AdminAuthSplitLayout>
  )
}

export function SignInForm() {
  return <AdminSignInForm config={MAIN_ADMIN_SIGN_IN_CONFIG} />
}
