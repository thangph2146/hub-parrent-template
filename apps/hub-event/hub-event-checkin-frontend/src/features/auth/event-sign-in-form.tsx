"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarDays,
  Eye,
  EyeOff,
  GraduationCap,
  QrCode,
  Sparkles,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@ui/components/button"
import { Card, CardContent } from "@ui/components/card"
import { Tabs, TabsList, TabsTrigger } from "@ui/components/tabs"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@ui/components/field"
import { Input } from "@ui/components/input"
import { PointerHighlight } from "@ui/components/pointer-highlight"
import {
  DevLoginAccountField,
  isDevLoginEnabled,
  useDevLoginOptions,
} from "@ui/components/auth"
import { Logo } from "@/components/icons/logo"
import {
  fetchDevLoginOptions,
  fetchGoogleClientId,
  loginEventGuest,
  loginEventGuestDevelopment,
  loginEventUserGoogle,
  loginEventUser,
  loginEventUserDevelopment,
  readEventSession,
  type EventLoginKind,
  type EventSessionUser,
} from "@/lib/event-auth"
import {
  resolveLoginRoleFromReturnPath,
  resolvePostLoginDestination,
} from "@/lib/event-portal-routes"
import {
  assertStudentSchoolEmail,
  STUDENT_EMAIL_SUFFIX,
} from "@/lib/student-email"

const HUB_CAMPUS_IMAGE =
  "https://hub.edu.vn/DATA/IMAGES/2024/12/31/20241231235033-1vehub.jpg"

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string
            hosted_domain?: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon"
              theme?: "outline" | "filled_blue" | "filled_black"
              size?: "large" | "medium" | "small"
              text?: "signin_with" | "signup_with" | "continue_with"
              shape?: "rectangular" | "pill" | "circle" | "square"
              width?: number
            }
          ) => void
        }
      }
    }
  }
}

function LoginVisualPanel() {
  return (
    <div className="relative hidden min-h-[520px] overflow-hidden md:block md:h-full md:min-h-0">
      <img
        src={HUB_CAMPUS_IMAGE}
        alt="Khuôn viên Trường Đại học Ngân hàng TP. HCM"
        className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/75 to-secondary/30"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-lg">
            <Logo className="size-9" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              Banking University HCMC
            </p>
            <p className="text-lg leading-tight font-bold text-white">
              HUB Events
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md">
            <p className="text-sm leading-relaxed font-medium text-white/90">
              Sinh viên và khách đều có thể đăng nhập để xem sự kiện, đăng ký
              tham gia và quản lý mã check-in tại một nơi.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-white/90">
            <li className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <CalendarDays className="size-4" />
              </span>
              Xem lịch &amp; hạn đăng ký rõ ràng
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <QrCode className="size-4" />
              </span>
              Check-in QR nhanh tại sự kiện
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Sparkles className="size-4" />
              </span>
              Cập nhật từ hệ thống chính thức của trường
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function initialLoginKind(nextFromUrl: string | null): EventLoginKind {
  if (!nextFromUrl) return "student"
  return resolveLoginRoleFromReturnPath(nextFromUrl) === "guest"
    ? "guest"
    : "student"
}

function EventSignInFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDevelopment = isDevLoginEnabled()

  const nextFromUrl = searchParams.get("next")
  const [accountKind, setAccountKind] = useState<EventLoginKind>(() =>
    initialLoginKind(nextFromUrl),
  )

  const resolveDestination = useCallback(
    (user: EventSessionUser) =>
      resolvePostLoginDestination(user, nextFromUrl),
    [nextFromUrl],
  )
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
    () => fetchDevLoginOptions(accountKind),
    [accountKind],
  )
  const [googleClientId, setGoogleClientId] = useState("")
  const [googleBusy, setGoogleBusy] = useState(false)
  const [currentOrigin, setCurrentOrigin] = useState("")
  const googleBtnRef = useRef<HTMLDivElement>(null)
  const googleInitializedRef = useRef(false)

  useEffect(() => {
    const existing = readEventSession()
    if (existing) {
      router.replace(resolveDestination(existing))
    }
    setCurrentOrigin(window.location.origin)
  }, [router, resolveDestination])

  useEffect(() => {
    let cancelled = false
    void fetchGoogleClientId().then((clientId) => {
      if (!cancelled) setGoogleClientId(clientId)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setSelectedDevLoginId("")
    setError(null)
  }, [accountKind])

  useEffect(() => {
    if (accountKind !== "student") return
    if (!googleClientId || googleInitializedRef.current) return
    if (!googleBtnRef.current) return

    const renderGoogleButton = () => {
      const google = window.google?.accounts?.id
      if (!googleBtnRef.current || !google || googleInitializedRef.current)
        return

      googleInitializedRef.current = true
      googleBtnRef.current.innerHTML = ""
      google.initialize({
        client_id: googleClientId,
        hosted_domain: "st.buh.edu.vn",
        callback: (response) => {
          if (!response.credential) {
            toast.error("Không nhận được credential Google.")
            return
          }

          setGoogleBusy(true)
          void loginEventUserGoogle(response.credential)
            .then((user) => {
              toast.success("Đăng nhập Google thành công.")
              router.push(resolveDestination(user))
              router.refresh()
            })
            .catch((err) => {
              const message =
                err instanceof Error
                  ? err.message
                  : "Đăng nhập Google thất bại."
              setError(message)
              toast.error(message)
            })
            .finally(() => setGoogleBusy(false))
        },
      })
      google.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: googleBtnRef.current.clientWidth || 360,
      })
    }

    if (window.google?.accounts?.id) {
      renderGoogleButton()
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = renderGoogleButton
    document.head.appendChild(script)

    return () => {
      script.onload = null
    }
  }, [accountKind, googleClientId, resolveDestination, router])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      let user: EventSessionUser
      if (isDevelopment && selectedDevLoginId) {
        user =
          accountKind === "guest"
            ? await loginEventGuestDevelopment(selectedDevLoginId)
            : await loginEventUserDevelopment(selectedDevLoginId)
        toast.success("Đăng nhập development thành công.")
      } else if (accountKind === "guest") {
        user = await loginEventGuest(email, password)
        toast.success("Đăng nhập khách thành công.")
      } else {
        assertStudentSchoolEmail(email)
        user = await loginEventUser(email, password)
        toast.success("Đăng nhập sinh viên thành công.")
      }
      router.push(resolveDestination(user))
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đăng nhập thất bại."
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }

  const isStudent = accountKind === "student"

  return (
    <div className="relative mx-auto w-full max-w-[1040px] px-6 py-8 md:py-12">
      <Card className="overflow-hidden rounded-2xl border-0 p-0 shadow-xl ring-1 shadow-secondary/10 ring-border/60">
        <CardContent className="grid min-h-0 p-0 md:grid-cols-[1fr_minmax(340px,440px)] md:items-stretch">
          <form
            onSubmit={(e) => void onSubmit(e)}
            className="flex flex-col justify-center bg-card p-6 sm:p-8 md:p-10 lg:p-12"
          >
            <Tabs
              value={accountKind}
              onValueChange={(value) => {
                const kind = (value as EventLoginKind) ?? "student"
                if (kind === accountKind) return
                setAccountKind(kind)
              }}
              className="mb-6 gap-4"
            >
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="student" className="gap-2 rounded-lg">
                  <GraduationCap className="size-4" />
                  Sinh viên
                </TabsTrigger>
                <TabsTrigger value="guest" className="gap-2 rounded-lg">
                  <Users className="size-4" />
                  Khách
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <FieldGroup className="gap-5">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-xl font-bold tracking-tight text-secondary">
                  {isStudent ? "Tài khoản sinh viên" : "Tài khoản khách"}
                </h2>
                <PointerHighlight>
                  <p className="relative z-10 text-base font-semibold text-primary">
                    {isStudent
                      ? `Email ${STUDENT_EMAIL_SUFFIX} · Google`
                      : "Phụ huynh & cá nhân HUB"}
                  </p>
                </PointerHighlight>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {isStudent
                    ? `Chỉ chấp nhận email sinh viên đuôi ${STUDENT_EMAIL_SUFFIX} (đăng nhập hoặc Google).`
                    : "Dùng tài khoản phụ huynh/cá nhân — không giới hạn đuôi email."}
                </p>
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
                  disabled={busy || googleBusy}
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
                    onChange={(e) => {
                      if (selectedDevLoginId) setSelectedDevLoginId("")
                      setEmail(e.target.value)
                    }}
                    required
                    disabled={busy || googleBusy}
                    placeholder={
                      isStudent
                        ? `masv${STUDENT_EMAIL_SUFFIX}`
                        : "email@example.com"
                    }
                    className="h-11 rounded-lg bg-background"
                  />
                  {isStudent ? (
                    <FieldDescription>
                      Ví dụ: masv{STUDENT_EMAIL_SUFFIX}
                    </FieldDescription>
                  ) : null}
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className="font-medium text-primary"
                  >
                    Mật khẩu
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        if (selectedDevLoginId) setSelectedDevLoginId("")
                        setPassword(e.target.value)
                      }}
                      required={!isDevelopment || !selectedDevLoginId}
                      disabled={
                        busy ||
                        googleBusy ||
                        (isDevelopment && !!selectedDevLoginId)
                      }
                      placeholder={
                        isDevelopment && selectedDevLoginId
                          ? "Bỏ qua mật khẩu khi chọn tài khoản development"
                          : "Nhập mật khẩu của bạn"
                      }
                      className="h-11 rounded-lg bg-background pr-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-1 size-9 -translate-y-1/2 hover:bg-transparent"
                      onClick={() => setShowPassword((v) => !v)}
                      disabled={busy || googleBusy}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="min-h-[48px] w-full rounded-lg bg-destructive text-base font-bold text-destructive-foreground shadow-md shadow-destructive/20 hover:bg-destructive/90"
                    disabled={busy || googleBusy}
                  >
                    {busy
                      ? isDevelopment && selectedDevLoginId
                        ? "Đang đăng nhập development..."
                        : "Đang đăng nhập..."
                      : "Đăng nhập"}
                  </Button>
                </Field>
                {isStudent ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Hoặc Google ({STUDENT_EMAIL_SUFFIX})
                        </span>
                      </div>
                    </div>
                    <Field>
                      <div
                        ref={googleBtnRef}
                        className="flex min-h-11 w-full items-center justify-center"
                      >
                        {!googleClientId ? (
                          <span className="text-sm text-muted-foreground">
                            Chưa cấu hình Google Client ID.
                          </span>
                        ) : null}
                      </div>
                      {currentOrigin ? (
                        <FieldDescription className="text-center text-xs">
                          Origin hiện tại:{" "}
                          <code className="rounded bg-muted px-1">
                            {currentOrigin}
                          </code>
                        </FieldDescription>
                      ) : null}
                    </Field>
                  </>
                ) : null}
                {error ? <FieldError>{error}</FieldError> : null}

                <FieldDescription className="text-center text-sm md:text-left">
                  Sau khi đăng nhập, bạn sẽ quay lại trang sự kiện.{" "}
                  <Link
                    href="/"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Về trang chủ
                  </Link>
                </FieldDescription>
              </FieldGroup>
          </form>

          <LoginVisualPanel />
        </CardContent>
      </Card>
    </div>
  )
}

export function EventSignInForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          Đang tải…
        </div>
      }
    >
      <EventSignInFormInner />
    </Suspense>
  )
}
