"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import type { DevLoginOption } from "@workspace/api-client";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/components/card";
import { Container, Page, PageContent } from "@ui/components/layout";
import {
  STORE_CONTAINER_INSET,
  STORE_CONTAINER_MAX_AUTH,
  STORE_PAGE_CONTENT_CENTER_CLASS,
  STORE_PAGE_CONTENT_CLASS,
} from "@ui/lib/layout-shell";
import { Store, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MockSession } from "@/hooks/use-session";
import { ApiError } from "@/lib/api";
import { safeRelativeNext } from "@/lib/auth-routes";
import { hydrateCartAfterLogin } from "@/lib/cart-sync";
import { STORE_AUTH_FORM_CARD_CLASS } from "@/lib/store-ui";
import {
  fetchStoreDevLoginOptions,
  loginStoreUser,
  loginStoreUserDevelopment,
  writeStoreSession,
} from "@/lib/store-auth";

const DEV_PRESET_NONE = "__none__";
const IS_DEV = process.env.NODE_ENV === "development";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [devPreset, setDevPreset] = useState(DEV_PRESET_NONE);
  const [devOptions, setDevOptions] = useState<DevLoginOption[]>([]);
  const [devOptionsLoading, setDevOptionsLoading] = useState(IS_DEV);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(
    () => safeRelativeNext(searchParams.get("next")),
    [searchParams],
  );

  useEffect(() => {
    if (!IS_DEV) return;
    let cancelled = false;
    void fetchStoreDevLoginOptions()
      .then((options) => {
        if (!cancelled) setDevOptions(options);
      })
      .finally(() => {
        if (!cancelled) setDevOptionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDevUser = useMemo(
    () => devOptions.find((o) => o.id === devPreset) ?? null,
    [devOptions, devPreset],
  );

  const completeLogin = async (session: MockSession) => {
    writeStoreSession(session);
    await hydrateCartAfterLogin();
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    toast.success(`Xin chào ${session.displayName}`);
    router.push(nextPath);
  };

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      if (IS_DEV && selectedDevUser) {
        const session = await loginStoreUserDevelopment(selectedDevUser.id);
        await completeLogin(session);
        return;
      }

      if (!email.trim() || !password) {
        toast.error("Vui lòng nhập email và mật khẩu");
        return;
      }

      const session = await loginStoreUser(email.trim(), password);
      await completeLogin(session);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Không kết nối được máy chủ";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContent className={STORE_PAGE_CONTENT_CLASS}>
      <Container max={STORE_CONTAINER_MAX_AUTH} className={STORE_CONTAINER_INSET}>
        <Card className={STORE_AUTH_FORM_CARD_CLASS}>
          <CardHeader className="space-y-2 text-center pb-6">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
              <Store className="text-primary w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              Hub B2B
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Hệ thống quản lý đại lý và mua sỉ
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {IS_DEV ? (
              <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 dark:bg-amber-950/30 px-3 py-3 space-y-2">
                <p className="text-xs font-bold text-amber-950 dark:text-amber-100/90">
                  Development: đăng nhập nhanh
                </p>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-100/70 leading-snug">
                  Chọn tài khoản từ database seed — bấm đăng nhập không cần
                  mật khẩu. Danh sách lấy từ{" "}
                  <code className="font-mono">GET /public/dev-login-options</code>
                  .
                </p>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dev-account-preset"
                    className="text-xs font-medium"
                  >
                    Tài khoản seed
                  </Label>
                  <Select
                    value={devPreset}
                    onValueChange={(v) => {
                      const next = v ?? DEV_PRESET_NONE;
                      setDevPreset(next);
                      const option = devOptions.find((o) => o.id === next);
                      if (option) {
                        setEmail(option.email);
                        setPassword("");
                      }
                    }}
                    disabled={devOptionsLoading}
                  >
                    <SelectTrigger
                      id="dev-account-preset"
                      className="h-10 w-full rounded-lg bg-background text-sm"
                    >
                      <SelectValue
                        placeholder={
                          devOptionsLoading
                            ? "Đang tải tài khoản…"
                            : "— Chọn tài khoản seed —"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEV_PRESET_NONE}>
                        — Nhập email/mật khẩu thủ công —
                      </SelectItem>
                      {devOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          <span className="block">
                            {option.name?.trim() || option.email}
                          </span>
                          <span className="block text-[11px] text-muted-foreground font-mono">
                            {option.email}
                            {option.roleLabels.length > 0
                              ? ` · ${option.roleLabels.join(", ")}`
                              : ""}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDevUser ? (
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {selectedDevUser.description}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hub.edu.vn"
                  className="pl-10 h-12"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (devPreset !== DEV_PRESET_NONE) setDevPreset(DEV_PRESET_NONE);
                  }}
                  autoComplete="email"
                  disabled={Boolean(selectedDevUser)}
                />
              </div>
            </div>

            {!selectedDevUser ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password-login" className="text-sm font-medium">
                    Mật khẩu
                  </Label>
                  <Link
                    href="/support"
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    className="pl-10 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleLogin();
                    }}
                    autoComplete="current-password"
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-outline-variant/40 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Dev: đã chọn <strong>{selectedDevUser.email}</strong> — bấm đăng
                nhập để vào ngay (không cần mật khẩu).
              </p>
            )}

            <Button
              className="w-full h-12 text-base font-bold mt-6"
              size="lg"
              disabled={submitting || (IS_DEV && devOptionsLoading)}
              onClick={() => void handleLogin()}
            >
              {submitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Đăng nhập hệ thống
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Chưa có tài khoản đại lý?{" "}
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </Container>
    </PageContent>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <PageContent className={STORE_PAGE_CONTENT_CENTER_CLASS}>
            <Loader2 className="size-10 animate-spin text-primary" />
          </PageContent>
        </Page>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
