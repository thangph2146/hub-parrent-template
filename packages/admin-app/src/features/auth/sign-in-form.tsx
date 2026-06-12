"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@ui/components/sonner"
import { Eye, EyeOff } from "lucide-react"
import type { AuthUser } from "@workspace/api-client"
import { Button } from "@ui/components/button"
import { Card, CardContent } from "@ui/components/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import { PointerHighlight } from "@ui/components/pointer-highlight"
import { TypographyH2 } from "@ui/components/typography"
import {
  DevLoginAccountField,
  isDevLoginEnabled,
  useDevLoginOptions,
} from "@ui/components/auth"
import { useAdminLayout } from "@ui/components/admin"
import { useAuth, useClientReady } from "@workspace/admin-app/runtime"
import {
  fetchDevLoginOptions,
  fetchGoogleOAuthConfig,
} from "@workspace/admin-app/features/auth/auth-api"
import { AUTH_LOGIN_PATH, AUTH_REGISTER_PATH } from "@workspace/admin-app/lib/auth-routes"
import { ADMIN_SESSION_EVENT, writeAdminSession } from "@workspace/admin-app/lib/auth-session"
import { MAIN_ADMIN_SIGN_IN_CONFIG } from "./sign-in-form.main-config"
import type {
  AdminLoginResult,
  AdminSignInFormConfig,
  AdminSignInLoginLock,
} from "./sign-in-form.types"

export type { AdminSignInFormConfig, AdminSignInLoginLock } from "./sign-in-form.types"
export { MAIN_ADMIN_SIGN_IN_CONFIG } from "./sign-in-form.main-config"

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
  const { siteName, siteDescription } = useAdminLayout()
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
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  const staffOnlyToastRef = useRef(false)
  const bridgeHandledRef = useRef(false)
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const googleInitializedRef = useRef(false)

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
      router.replace(AUTH_LOGIN_PATH)
      return
    }

    const gate = config.beforePersistSession?.() ?? { ok: true as const }
    if (!gate.ok) {
      toast.error(gate.message ?? "Không thể đồng bộ phiên đăng nhập.")
      router.replace(AUTH_LOGIN_PATH)
      return
    }

    config.onBridgePersist?.(user)
    writeAdminSession(user)
    window.dispatchEvent(new Event(ADMIN_SESSION_EVENT))
    toast.success("Đã chuyển sang cổng quản trị.")
    router.replace(config.homePath)
  }, [clientReady, config, router])

  useEffect(() => {
    if (!clientReady || staffOnlyToastRef.current) return
    if (typeof window === "undefined") return
    const q = new URLSearchParams(window.location.search)
    if (q.get("reason") !== "staff_only") return
    staffOnlyToastRef.current = true
    toast.error(
      "Tài khoản phụ huynh không dùng được cổng quản trị nội bộ. Hãy đăng nhập ở cổng phụ huynh HUB Parent."
    )
    router.replace(AUTH_LOGIN_PATH)
  }, [clientReady, router])

  useEffect(() => {
    if (!clientReady) return
    if (googleInitializedRef.current) return

    let cancelled = false

    fetchGoogleOAuthConfig()
      .then((resolved) => {
        if (cancelled) return
        setGoogleClientId(resolved.clientId)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [clientReady])

  useEffect(() => {
    if (!clientReady || !googleClientId || googleInitializedRef.current) return
    if (!googleBtnRef.current) return

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => {
      const googleId = window.google?.accounts?.id
      if (!googleId || googleInitializedRef.current) return
      googleInitializedRef.current = true
      googleId.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            toast.error("Đăng nhập Google thất bại.")
            return
          }
          setBusy(true)
          try {
            if (!loginGoogle) {
              toast.error("Đăng nhập Google chưa sẵn sàng.")
              return
            }
            const result = await loginGoogle(response.credential)
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
        },
      })
      googleId.renderButton(googleBtnRef.current!, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "signin_with",
        size: "large",
        width: googleBtnRef.current!.clientWidth || 300,
      })
    }
    document.head.appendChild(script)

    return () => {}
  }, [clientReady, config, googleClientId, loginGoogle, loginLock, router])

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full h-full max-w-5xl">
        <div className="flex flex-col gap-4">
          <Card className="w-full overflow-hidden rounded-lg border p-0 shadow-sm">
            <CardContent className="grid grid-cols-1 p-0 md:grid-cols-2">
              <form onSubmit={onSubmit} className="p-6 md:p-8 lg:p-10">
                <FieldGroup className="gap-4">
                  {loginLock && !loginLock.ok ? (
                    <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-950 dark:text-amber-50">
                      {loginLock.message}
                    </div>
                  ) : null}
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <TypographyH2 className="text-2xl font-bold text-secondary sm:text-xl md:text-3xl lg:text-3xl">
                      Đăng nhập hệ thống
                    </TypographyH2>
                    <div className="flex flex-col items-center gap-1">
                      <PointerHighlight>
                        <p className="relative z-10 text-lg font-bold tracking-tight text-primary uppercase sm:text-sm md:text-xl xl:text-2xl">
                          {siteName}
                        </p>
                      </PointerHighlight>
                      {siteDescription ? (
                        <p className="text-sm font-medium text-muted-foreground italic md:text-base">
                          {siteDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {isDevelopment ? (
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
                  ) : null}

                  <Field>
                    <FieldLabel
                      htmlFor="email"
                      className="font-medium text-primary"
                    >
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
                      placeholder="example@email.com"
                    />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel
                        htmlFor="password"
                        className="font-medium text-primary"
                      >
                        Mật khẩu
                      </FieldLabel>
                      <Link
                        href={AUTH_REGISTER_PATH}
                        className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
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
                        required={!isDevelopment || !selectedDevLoginId}
                        disabled={
                          busy || (isDevelopment && !!selectedDevLoginId)
                        }
                        placeholder={
                          isDevelopment && selectedDevLoginId
                            ? "Đã bỏ qua mật khẩu cho tài khoản development đã chọn"
                            : "Nhập mật khẩu của bạn"
                        }
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((value) => !value)}
                        disabled={busy}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      className="min-h-[44px] w-full bg-destructive px-8 text-destructive-foreground hover:bg-destructive/90"
                      disabled={busy}
                    >
                      <span className="text-base font-bold">
                        {busy
                          ? isDevelopment && selectedDevLoginId
                            ? "Đang đăng nhập development..."
                            : "Đang đăng nhập..."
                          : "Đăng nhập"}
                      </span>
                    </Button>
                  </Field>

                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Hoặc tiếp tục với
                  </FieldSeparator>

                  <Field>
                    <div
                      ref={googleBtnRef}
                      className="flex min-h-[44px] w-full items-center justify-center"
                    >
                      {!googleClientId && (
                        <span className="text-sm text-muted-foreground">
                          Đăng nhập Google chưa được cấu hình.
                        </span>
                      )}
                    </div>
                  </Field>

                  <FieldError>{error}</FieldError>

                  <FieldDescription className="text-center text-sm md:text-base">
                    Nếu bạn chưa có tài khoản?{" "}
                    <Link
                      href={AUTH_REGISTER_PATH}
                      className="font-bold text-primary transition-colors hover:text-primary/80"
                    >
                      Đăng ký
                    </Link>
                  </FieldDescription>
                </FieldGroup>
              </form>

              <div className="relative hidden bg-muted text-foreground md:flex">
                <img
                  src="https://hub.edu.vn/DATA/IMAGES/2024/12/31/20241231235033-1vehub.jpg"
                  alt="Hình ảnh HUB"
                  title="Hình ảnh HUB"
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function SignInForm() {
  return <AdminSignInForm config={MAIN_ADMIN_SIGN_IN_CONFIG} />
}
