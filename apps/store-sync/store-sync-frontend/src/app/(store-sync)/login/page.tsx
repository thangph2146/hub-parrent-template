"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
  DevLoginAccountField,
  DEV_LOGIN_MANUAL_VALUE,
  isDevLoginEnabled,
  resolveDevLoginOption,
  useDevLoginOptions,
} from "@ui/components/auth";
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

const IS_DEV = isDevLoginEnabled();

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [devPreset, setDevPreset] = useState(DEV_LOGIN_MANUAL_VALUE);
  const [submitting, setSubmitting] = useState(false);
  const { options: devOptions, loading: devOptionsLoading } = useDevLoginOptions(
    () => fetchStoreDevLoginOptions(),
    [],
  );

  const nextPath = useMemo(
    () => safeRelativeNext(searchParams.get("next")),
    [searchParams],
  );

  const selectedDevUser = useMemo(
    () => resolveDevLoginOption(devOptions, devPreset),
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
        const session = await loginStoreUserDevelopment(
          String(selectedDevUser.id),
        );
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
            <DevLoginAccountField
              variant="highlight"
              allowManual
              showSelectedDescription
              value={devPreset}
              onValueChange={(value, option) => {
                setDevPreset(value);
                if (option) {
                  setEmail(option.email);
                  setPassword("");
                }
              }}
              options={devOptions}
              loading={devOptionsLoading}
              disabled={submitting}
            />

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
                    if (devPreset !== DEV_LOGIN_MANUAL_VALUE) {
                      setDevPreset(DEV_LOGIN_MANUAL_VALUE);
                    }
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
