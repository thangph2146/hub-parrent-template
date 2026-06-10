"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  LogIn,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import {
  buildLoginHref,
  readEventSession,
  subscribeEventSession,
  type EventSessionUser,
} from "@/lib/event-auth";
import {
  getRegistrationWindowState,
  registerForEvent,
  type RegistrationWindowState,
} from "@/lib/event-registration";
import { formatRange } from "@/lib/registration-format";
import {
  getPublicEventBySlug,
  type PublicEventDetail,
  type PublicViewerRegistration,
} from "@/lib/public-events";
import { useSyncExternalStore } from "react";

type EventRegistrationPanelProps = {
  event: PublicEventDetail;
  eventPath: string;
  onEventRefresh?: (detail: PublicEventDetail) => void;
};

function useEventSession(): EventSessionUser | null {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null,
  );
}

export function EventRegistrationPanel({
  event,
  eventPath,
  onEventRefresh,
}: EventRegistrationPanelProps) {
  const router = useRouter();
  const session = useEventSession();
  const windowState = getRegistrationWindowState(event);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalRegistrations, setTotalRegistrations] = useState(
    event.totalRegistrations,
  );
  const [myRegistration, setMyRegistration] = useState<
    PublicViewerRegistration | null | undefined
  >(event.myRegistration);

  const slug = event.slug ?? event.id;
  const loginHref = buildLoginHref(eventPath);
  const isRegistered = done || Boolean(myRegistration);

  useEffect(() => {
    setTotalRegistrations(event.totalRegistrations);
    setMyRegistration(event.myRegistration);
  }, [event.totalRegistrations, event.myRegistration]);

  useEffect(() => {
    if (!session?.id) {
      setMyRegistration(null);
      return;
    }
    let cancelled = false;
    void getPublicEventBySlug(slug, { userId: session.id }).then((detail) => {
      if (cancelled || !detail) return;
      setTotalRegistrations(detail.totalRegistrations);
      setMyRegistration(detail.myRegistration ?? null);
      if (detail.myRegistration) setDone(true);
      onEventRefresh?.(detail);
    });
    return () => {
      cancelled = true;
    };
  }, [session?.id, slug, onEventRefresh]);

  const spotsLeft =
    event.maxParticipants > 0
      ? Math.max(0, event.maxParticipants - totalRegistrations)
      : null;

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      await registerForEvent(slug, phone);
      setDone(true);
      const detail = session?.id
        ? await getPublicEventBySlug(slug, { userId: session.id })
        : null;
      if (detail) {
        setTotalRegistrations(detail.totalRegistrations);
        setMyRegistration(detail.myRegistration ?? null);
        onEventRefresh?.(detail);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <RegistrationMeta
        windowState={windowState}
        event={event}
        totalRegistrations={totalRegistrations}
        spotsLeft={spotsLeft}
      />

      {isRegistered ? (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40">
          <CheckCircle2 className="size-4 text-green-700" />
          <AlertTitle>Đã đăng ký thành công</AlertTitle>
          <AlertDescription>
            Bạn đã ghi danh tham gia sự kiện. Vui lòng theo dõi email hoặc cổng
            sinh viên để nhận hướng dẫn check-in.
          </AlertDescription>
        </Alert>
      ) : !session ? (
        <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <LogIn className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Đăng nhập để đăng ký</p>
              <p className="text-sm text-muted-foreground">
                Sinh viên hoặc khách (phụ huynh/cá nhân) cần đăng nhập tài khoản
                HUB trước khi ghi danh tham gia sự kiện này.
              </p>
            </div>
          </div>
          <Link
            href={loginHref}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Đăng nhập ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {session.name || session.email}
              </p>
              <p className="truncate text-xs text-muted-foreground">{session.email}</p>
            </div>
          </div>

          {windowState.open ? (
            <>
              <div className="space-y-2">
                <label htmlFor="reg-phone" className="text-sm font-medium">
                  Số điện thoại (tuỳ chọn)
                </label>
                <Input
                  id="reg-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  className="rounded-lg"
                />
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                className="w-full rounded-lg"
                disabled={loading}
                onClick={() => void handleRegister()}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang gửi đăng ký…
                  </>
                ) : (
                  "Xác nhận đăng ký tham gia"
                )}
              </Button>
            </>
          ) : (
            <Alert>
              <ShieldAlert className="size-4" />
              <AlertDescription>{windowState.reason}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

function RegistrationMeta({
  windowState,
  event,
  totalRegistrations,
  spotsLeft,
}: {
  windowState: RegistrationWindowState;
  event: PublicEventDetail;
  totalRegistrations: number;
  spotsLeft: number | null;
}) {
  return (
    <dl className="grid gap-3 text-sm">
      <div className="flex justify-between gap-2 border-b border-border/60 pb-2">
        <dt className="text-muted-foreground">Đã đăng ký</dt>
        <dd className="font-semibold tabular-nums">{totalRegistrations}</dd>
      </div>
      {spotsLeft !== null ? (
        <div className="flex justify-between gap-2 border-b border-border/60 pb-2">
          <dt className="text-muted-foreground">Chỗ còn lại</dt>
          <dd className="font-semibold tabular-nums text-primary">{spotsLeft}</dd>
        </div>
      ) : null}
      {(event.registrationStart || event.registrationEnd) && (
        <div className="space-y-0.5">
          <dt className="text-muted-foreground">Thời hạn đăng ký</dt>
          <dd className="font-medium">
            {formatRange(event.registrationStart, event.registrationEnd)}
          </dd>
        </div>
      )}
      {!windowState.open ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          {windowState.reason}
        </p>
      ) : (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-800 dark:bg-green-950/50 dark:text-green-300">
          Đang mở đăng ký — đăng nhập sinh viên hoặc khách để tham gia.
        </p>
      )}
    </dl>
  );
}
