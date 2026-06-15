"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"
import {
  CheckCircle2,
  Clock3,
  Loader2,
  LogIn,
  UserRound,
} from "lucide-react"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import { Badge } from "@ui/components/badge"
import { Card, CardContent } from "@ui/components/card"
import { cn } from "@ui/lib/utils"
import {
  buildLoginHref,
  readEventSession,
  subscribeEventSession,
  type EventSessionUser,
} from "@/lib/portal/event-auth"
import {
  getRegistrationWindowState,
  registerForEvent,
  type RegistrationWindowState,
} from "@/lib/site/event-registration"
import { formatRange } from "@/lib/site/registration-format"
import {
  getPublicEventBySlug,
  type PublicEventDetail,
  type PublicViewerRegistration,
} from "@/lib/site/public-events"

type EventRegistrationPanelProps = {
  event: PublicEventDetail
  eventPath: string
  onEventRefresh?: (detail: PublicEventDetail) => void
  layout?: "aside" | "inline"
}

function useEventSession(): EventSessionUser | null {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null,
  )
}

function RegistrationStatusBadge({
  windowState,
}: {
  windowState: RegistrationWindowState
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        windowState.open
          ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
          : "bg-amber-500/10 text-amber-900 dark:text-amber-200",
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          windowState.open ? "bg-emerald-500" : "bg-amber-500",
        )}
        aria-hidden
      />
      {windowState.open ? "Đang mở đăng ký" : "Chưa mở đăng ký"}
    </span>
  )
}

function RegistrationStatsRow({
  totalRegistrations,
  spotsLeft,
}: {
  totalRegistrations: number
  spotsLeft: number | null
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-border/80 rounded-xl border border-border/70 bg-muted/20">
      <div className="px-4 py-3 text-center">
        <p className="text-2xl font-bold tabular-nums leading-none text-foreground">
          {totalRegistrations}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">Đã đăng ký</p>
      </div>
      <div className="px-4 py-3 text-center">
        <p
          className={cn(
            "text-2xl font-bold tabular-nums leading-none",
            spotsLeft !== null ? "text-primary" : "text-foreground",
          )}
        >
          {spotsLeft !== null ? spotsLeft : "∞"}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {spotsLeft !== null ? "Chỗ còn lại" : "Không giới hạn"}
        </p>
      </div>
    </div>
  )
}

function headerSubtitle(
  session: EventSessionUser | null,
  isRegistered: boolean,
  windowState: RegistrationWindowState,
): string {
  if (isRegistered) return "Bạn đã ghi danh thành công sự kiện này."
  if (!session) return "Đăng nhập tài khoản HUB để ghi danh."
  if (windowState.open) return "Xác nhận thông tin và hoàn tất đăng ký."
  return windowState.reason
}

export function EventRegistrationPanel({
  event,
  eventPath,
  onEventRefresh,
  layout = "inline",
}: EventRegistrationPanelProps) {
  const router = useRouter()
  const session = useEventSession()
  const windowState = getRegistrationWindowState(event)
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalRegistrations, setTotalRegistrations] = useState(
    event.totalRegistrations,
  )
  const [myRegistration, setMyRegistration] = useState<
    PublicViewerRegistration | null | undefined
  >(event.myRegistration)

  const slug = event.slug ?? event.id
  const loginHref = buildLoginHref(eventPath)
  const isRegistered = done || Boolean(myRegistration)
  const hasRegistrationPeriod = Boolean(
    event.registrationStart || event.registrationEnd,
  )

  useEffect(() => {
    setTotalRegistrations(event.totalRegistrations)
    setMyRegistration(event.myRegistration)
  }, [event.totalRegistrations, event.myRegistration])

  useEffect(() => {
    if (!session?.id) {
      setMyRegistration(null)
      return
    }
    let cancelled = false
    void getPublicEventBySlug(slug, { userId: session.id })
      .then((detail) => {
        if (cancelled || !detail) return
        setTotalRegistrations(detail.totalRegistrations)
        setMyRegistration(detail.myRegistration ?? null)
        if (detail.myRegistration) setDone(true)
        onEventRefresh?.(detail)
      })
      .catch(() => {
        // Giữ dữ liệu SSR khi refresh đăng ký thất bại (mạng / session lỗi).
      })
    return () => {
      cancelled = true
    }
  }, [session?.id, slug, onEventRefresh])

  const spotsLeft =
    event.maxParticipants > 0
      ? Math.max(0, event.maxParticipants - totalRegistrations)
      : null

  const handleRegister = async () => {
    setError(null)
    setLoading(true)
    try {
      await registerForEvent(slug, phone)
      setDone(true)
      const detail = session?.id
        ? await getPublicEventBySlug(slug, { userId: session.id })
        : null
      if (detail) {
        setTotalRegistrations(detail.totalRegistrations)
        setMyRegistration(detail.myRegistration ?? null)
        onEventRefresh?.(detail)
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  const body = (
    <div className="space-y-5">
      <RegistrationStatsRow
        totalRegistrations={totalRegistrations}
        spotsLeft={spotsLeft}
      />

      {hasRegistrationPeriod ? (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            <span className="font-medium text-foreground/80">
              Thời hạn đăng ký:{" "}
            </span>
            {formatRange(event.registrationStart, event.registrationEnd)}
          </span>
        </p>
      ) : null}

      <div className="border-t border-border/70 pt-5">
        {isRegistered ? (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-500/8 px-4 py-3.5 ring-1 ring-emerald-500/15">
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                Đã đăng ký thành công
              </p>
              <p className="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-200/75">
                Kiểm tra email hoặc mục Sự kiện của tôi để nhận hướng dẫn
                check-in.
              </p>
            </div>
          </div>
        ) : !session ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sinh viên hoặc khách HUB cần đăng nhập trước khi ghi danh.
            </p>
            <Button
              nativeButton={false}
              render={<Link href={loginHref} />}
              className="h-10 w-full rounded-lg"
            >
              <LogIn className="size-4" aria-hidden />
              Đăng nhập để đăng ký
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {session.name || session.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session.email}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                Đã đăng nhập
              </Badge>
            </div>

            {windowState.open ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="reg-phone" className="text-sm font-medium">
                    Số điện thoại{" "}
                    <span className="font-normal text-muted-foreground">
                      (tuỳ chọn)
                    </span>
                  </label>
                  <Input
                    id="reg-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    className="h-10 rounded-lg"
                  />
                </div>
                {error ? (
                  <p
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
                <Button
                  className="h-10 w-full rounded-lg"
                  disabled={loading}
                  onClick={() => void handleRegister()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang gửi đăng ký…
                    </>
                  ) : (
                    "Xác nhận đăng ký"
                  )}
                </Button>
              </>
            ) : (
              <Button
                className="h-10 w-full rounded-lg"
                disabled
                variant="secondary"
              >
                Chưa mở đăng ký
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (layout === "aside") {
    return (
      <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 py-0 shadow-sm ring-1 ring-foreground/5">
        <div className="border-b border-border/70 bg-muted/25 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Đăng ký tham gia
            </h2>
            <RegistrationStatusBadge windowState={windowState} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {headerSubtitle(session, isRegistered, windowState)}
          </p>
        </div>
        <CardContent className="p-5">{body}</CardContent>
      </Card>
    )
  }

  return <div className="space-y-4">{body}</div>
}
