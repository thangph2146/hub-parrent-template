"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Smartphone } from "lucide-react"
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
import { toast } from "@ui/components/sonner"
import { useAdminLayout } from "@ui/components/admin"
import { AdminAuthFormHeader } from "../_layout/admin-auth-form-header"
import { AdminAuthFormHero } from "../_layout/admin-auth-form-hero"
import { AdminAuthFormSkeleton } from "../_layout/admin-auth-form-skeleton"
import { AdminAuthGoogleButton } from "../shared/admin-auth-google-button"
import { AdminAuthSplitLayout } from "../_layout/admin-auth-split-layout"
import { useAdminAuthPageDisplay } from "../_hooks/use-admin-auth-page-display"
import { registerAccount } from "../shared/auth-api"
import { useAuth, useClientReady } from "@workspace/admin-app/runtime"
import type { AdminRegisterFormConfig } from "./register-form.types"

export type { AdminRegisterFormConfig } from "./register-form.types"

const DEFAULT_SUCCESS_TOAST =
  "Đăng ký thành công. Tài khoản của bạn đã được tạo với vai trò Phụ huynh."

type RegisterFormState = {
  fullName: string
  email: string
  phone: string
  address: string
  password: string
  confirmPassword: string
}

const INITIAL_STATE: RegisterFormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
}

export function AdminRegisterForm({
  config,
}: {
  config?: AdminRegisterFormConfig
}) {
  const { loginPath: layoutLoginPath, homePath } = useAdminLayout()
  const loginPath = config?.loginPath ?? layoutLoginPath
  const afterAuthPath = homePath ?? loginPath
  const successToast = config?.successToast ?? DEFAULT_SUCCESS_TOAST
  const { siteName, siteDescription, heroImageSrc, isReady: brandingReady } =
    useAdminAuthPageDisplay()
  const { loginGoogle } = useAuth()
  const clientReady = useClientReady()
  const router = useRouter()
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function updateField<Key extends keyof RegisterFormState>(
    key: Key,
    value: RegisterFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.")
      return
    }

    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    try {
      setSubmitting(true)
      await registerAccount({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      })
      setForm(INITIAL_STATE)
      toast.success(successToast)
      router.replace(loginPath)
    } catch {
      /* toast: MutationCache */
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleCredential(credential: string) {
    if (!loginGoogle) {
      toast.error("Đăng nhập Google chưa sẵn sàng.")
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const result = await loginGoogle(credential)
      if (result !== "success") {
        toast.error("Đăng nhập Google thất bại.")
        return
      }
      toast.success("Đăng nhập Google thành công.")
      router.replace(afterAuthPath)
    } finally {
      setSubmitting(false)
    }
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
      <form onSubmit={handleSubmit}>
        <FieldGroup className="gap-4">
          {!brandingReady ? (
            <AdminAuthFormSkeleton />
          ) : (
            <>
              <AdminAuthFormHeader
                title="Đăng ký hệ thống"
                siteName={siteName}
                siteDescription={siteDescription}
              />

              <Field>
                <FieldLabel htmlFor="fullName" className="text-sm font-medium">
                  Họ và tên
                </FieldLabel>
                <Input
                  id="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  placeholder="Họ và tên"
                  required
                  disabled={submitting}
                  className="h-11"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="example@email.com"
                  required
                  disabled={submitting}
                  className="h-11"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone" className="text-sm font-medium">
                  Số điện thoại
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="Nhập số điện thoại của bạn"
                    disabled={submitting}
                    className="h-11 pr-10"
                  />
                  <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
                    <Smartphone className="size-4" aria-hidden />
                  </div>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Tạo mật khẩu"
                    required
                    disabled={submitting}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={submitting}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Xác nhận mật khẩu
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    placeholder="Xác nhận mật khẩu của bạn"
                    required
                    disabled={submitting}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    disabled={submitting}
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </Field>

              <Field className="pt-1">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full font-medium"
                  disabled={submitting}
                >
                  {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc tiếp tục với
              </FieldSeparator>

              <AdminAuthGoogleButton
                disabled={submitting || !clientReady}
                onCredential={handleGoogleCredential}
              />

              <FieldError>{error}</FieldError>

              <FieldDescription className="text-center text-sm">
                Đã có tài khoản?{" "}
                <Link
                  href={loginPath}
                  prefetch={false}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Đăng nhập
                </Link>
              </FieldDescription>
            </>
          )}
        </FieldGroup>
      </form>
    </AdminAuthSplitLayout>
  )
}

export function RegisterForm() {
  return <AdminRegisterForm />
}
