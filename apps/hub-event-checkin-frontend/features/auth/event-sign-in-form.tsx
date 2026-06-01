"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Eye,
  EyeOff,
  QrCode,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ui/components/button";
import { Card, CardContent } from "@ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@ui/components/field";
import { Input } from "@ui/components/input";
import { PointerHighlight } from "@ui/components/pointer-highlight";
import { TypographyH2 } from "@ui/components/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select";
import { Logo } from "@/components/icons/logo";
import {
  fetchDevLoginOptions,
  loginEventUser,
  loginEventUserDevelopment,
  readEventSession,
  type DevLoginOption,
} from "@/lib/event-auth";
import { safeRelativeNext } from "@/lib/auth-routes";

const HUB_CAMPUS_IMAGE =
  "https://hub.edu.vn/DATA/IMAGES/2024/12/31/20241231235033-1vehub.jpg";

function LoginVisualPanel() {
  return (
    <div className="relative hidden min-h-[520px] overflow-hidden md:block md:min-h-0 md:h-full">
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
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Banking University HCMC
            </p>
            <p className="text-lg font-bold leading-tight text-white">HUB Events</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md">
            <p className="text-sm font-medium leading-relaxed text-white/90">
              Đăng nhập để đọc đầy đủ lưu ý sự kiện, đăng ký tham gia và nhận mã
              check-in tại chỗ.
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
  );
}

function EventSignInFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeRelativeNext(searchParams.get("next"), "/");
  const isDevelopment = process.env.NODE_ENV === "development";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [devLoginOptions, setDevLoginOptions] = useState<DevLoginOption[]>([]);
  const [selectedDevLoginId, setSelectedDevLoginId] = useState("");
  const [devLoginOptionsLoading, setDevLoginOptionsLoading] = useState(false);

  useEffect(() => {
    const existing = readEventSession();
    if (existing) {
      router.replace(next);
    }
  }, [router, next]);

  useEffect(() => {
    if (!isDevelopment) return;

    let cancelled = false;
    setDevLoginOptionsLoading(true);

    void fetchDevLoginOptions()
      .then((options) => {
        if (!cancelled) setDevLoginOptions(options);
      })
      .finally(() => {
        if (!cancelled) setDevLoginOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isDevelopment]);

  const onSelectDevLogin = (value: string | null) => {
    const nextValue = value ?? "";
    setSelectedDevLoginId(nextValue);
    if (!nextValue) return;
    const picked = devLoginOptions.find((option) => option.id === nextValue);
    if (!picked) return;
    setEmail(picked.email);
    setPassword("");
    setError(null);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (isDevelopment && selectedDevLoginId) {
        await loginEventUserDevelopment(selectedDevLoginId);
        toast.success("Đăng nhập development thành công.");
      } else {
        await loginEventUser(email, password);
        toast.success("Đăng nhập thành công.");
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Đăng nhập thất bại.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-muted p-4 sm:p-6 md:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(167,27,41,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[1040px]">
        <div className="mb-5 flex items-center justify-center gap-3 md:hidden">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-border/60">
            <Logo className="size-8" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-secondary">HUB Events</p>
            <p className="text-xs text-muted-foreground">Đăng nhập sinh viên</p>
          </div>
        </div>

        <Card className="overflow-hidden rounded-2xl border-0 p-0 shadow-2xl shadow-secondary/10 ring-1 ring-border/60">
          <CardContent className="grid min-h-0 p-0 md:grid-cols-[1fr_minmax(340px,440px)] md:items-stretch">
            <form
              onSubmit={(e) => void onSubmit(e)}
              className="flex flex-col justify-center bg-card p-6 sm:p-8 md:p-10 lg:p-12"
            >
              <div className="mb-6 hidden items-center gap-3 md:flex">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary/5 ring-1 ring-border/80">
                  <Logo className="size-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hệ thống Sự kiện
                  </p>
                  <p className="font-bold text-secondary">HUB Events</p>
                </div>
              </div>

              <FieldGroup className="gap-5">
                <div className="space-y-2 text-center md:text-left">
                  <TypographyH2 className="text-2xl font-bold tracking-tight text-secondary md:text-3xl">
                    Đăng nhập sinh viên
                  </TypographyH2>
                  <PointerHighlight>
                    <p className="relative z-10 text-base font-semibold text-primary">
                      Mọi sự kiện tại HUB
                    </p>
                  </PointerHighlight>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Dùng email trường để tiếp tục đăng ký sự kiện bạn đang xem.
                  </p>
                </div>

                {isDevelopment ? (
                  <Field>
                    <FieldLabel className="font-medium text-primary">
                      Tài khoản development
                    </FieldLabel>
                    <Select
                      value={selectedDevLoginId}
                      onValueChange={onSelectDevLogin}
                      disabled={busy || devLoginOptionsLoading}
                    >
                      <SelectTrigger className="h-11 w-full rounded-lg bg-background">
                        <SelectValue
                          placeholder={
                            devLoginOptionsLoading
                              ? "Đang tải user từ database..."
                              : "Chọn tài khoản có sẵn trong database"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {devLoginOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name?.trim() || option.email} — {option.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Chỉ hiện khi NODE_ENV=development.
                    </FieldDescription>
                  </Field>
                ) : null}

                <Field>
                  <FieldLabel htmlFor="email" className="font-medium text-primary">
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      if (selectedDevLoginId) setSelectedDevLoginId("");
                      setEmail(e.target.value);
                    }}
                    required
                    disabled={busy}
                    placeholder="sinhvien@hub.edu.vn"
                    className="h-11 rounded-lg bg-background"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password" className="font-medium text-primary">
                    Mật khẩu
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        if (selectedDevLoginId) setSelectedDevLoginId("");
                        setPassword(e.target.value);
                      }}
                      required={!isDevelopment || !selectedDevLoginId}
                      disabled={busy || (isDevelopment && !!selectedDevLoginId)}
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
                      disabled={busy}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
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
                    disabled={busy}
                  >
                    {busy
                      ? isDevelopment && selectedDevLoginId
                        ? "Đang đăng nhập development..."
                        : "Đang đăng nhập..."
                      : "Đăng nhập"}
                  </Button>
                </Field>

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
    </div>
  );
}

export function EventSignInForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted text-muted-foreground">
          Đang tải…
        </div>
      }
    >
      <EventSignInFormInner />
    </Suspense>
  );
}
