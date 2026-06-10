"use client"

import Link from "next/link"
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle2,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useSyncExternalStore } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"
import { cn } from "@ui/lib/utils"
import { useAdminSession } from "@/components/shared/use-admin-session"
import {
  CHECKIN_ADMIN_HOME_PATH,
  CHECKIN_ADMIN_LOGIN_PATH,
  CHECKIN_ADMIN_PROFILE_PATH,
} from "@/config/admin/checkin-admin-access"
import {
  clearEventSession,
  getEventAccountLabel,
  getMyEventsPath,
  getProfilePath,
  isEventAuthLoginPath,
  isEventPortalPath,
  isStudentSession,
  readEventSession,
  subscribeEventSession,
} from "@/lib/event-auth"

function useEventSession() {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null,
  )
}

function displayNameOf(session: {
  name?: string | null
  email: string
}): string {
  return session.name?.trim() || session.email
}

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean)
  if (!parts.length) return "SV"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function UserAvatar({
  name,
  imageUrl,
  adminActive,
  className,
}: {
  name: string
  imageUrl: string | null
  adminActive?: boolean
  className?: string
}) {
  return (
    <span className={cn("relative shrink-0", className)}>
      <Avatar className="size-9 aspect-square after:rounded-lg">
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt="" className="rounded-lg" />
        ) : null}
        <AvatarFallback className="rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {adminActive ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500"
          aria-hidden
        />
      ) : null}
    </span>
  )
}

type HeaderAccountMenuProps = {
  layout?: "bar" | "sheet"
  showAdmin?: boolean
  onNavigate?: () => void
}

function AccountIdentity({
  name,
  email,
  accountLabel,
}: {
  name: string
  email: string
  accountLabel: string
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-foreground">{name}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
      <Badge variant="secondary" className="mt-2 h-5 px-1.5 text-[10px]">
        {accountLabel}
      </Badge>
    </div>
  )
}

function SheetActionLink({
  href,
  icon: Icon,
  label,
  description,
  onNavigate,
  accent = "default",
}: {
  href: string
  icon: typeof ClipboardList
  label: string
  description?: string
  onNavigate?: () => void
  accent?: "default" | "staff"
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 transition-colors hover:bg-muted/50",
        accent === "staff" && "border-brand-navy/20 bg-brand-navy/[0.04]",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          accent === "staff"
            ? "bg-gradient-to-br from-brand-navy to-brand-navy/85 text-white"
            : "bg-muted text-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {description ? (
          <span className="block text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
    </Link>
  )
}

export function HeaderAccountMenu({
  layout = "bar",
  showAdmin = true,
  onNavigate,
}: HeaderAccountMenuProps) {
  const session = useEventSession()
  const adminUser = useAdminSession()
  const pathname = usePathname()
  const router = useRouter()

  if (!session) return null

  const name = displayNameOf(session)
  const avatarUrl = session.image?.trim() || null
  const student = isStudentSession(session)
  const accountLabel = getEventAccountLabel(session)
  const myEventsPath = getMyEventsPath(session)
  const adminSignedIn = Boolean(adminUser)
  const adminHref = adminSignedIn
    ? CHECKIN_ADMIN_HOME_PATH
    : CHECKIN_ADMIN_LOGIN_PATH

  const handleLogout = () => {
    clearEventSession()
    onNavigate?.()
    if (isEventPortalPath(pathname) || isEventAuthLoginPath(pathname)) {
      router.replace("/")
      router.refresh()
      return
    }
    window.location.reload()
  }

  if (layout === "sheet") {
    return (
      <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/15 p-3">
        <div className="flex items-center gap-3 px-1">
          <UserAvatar
            name={name}
            imageUrl={avatarUrl}
            adminActive={showAdmin && adminSignedIn}
          />
          <AccountIdentity
            name={name}
            email={session.email}
            accountLabel={accountLabel}
          />
        </div>
        <div className="grid gap-2">
          <SheetActionLink
            href={myEventsPath}
            icon={ClipboardList}
            label="Sự kiện của tôi"
            description="Đăng ký và check-in QR"
            onNavigate={onNavigate}
          />
          {student ? (
            <SheetActionLink
              href={getProfilePath(session)}
              icon={UserCircle2}
              label="Hồ sơ sinh viên"
              onNavigate={onNavigate}
            />
          ) : null}
          {showAdmin ? (
            <>
              <SheetActionLink
                href={adminHref}
                icon={adminSignedIn ? LayoutDashboard : Shield}
                label="Quản trị sự kiện"
                description={
                  adminSignedIn ? "Đã đăng nhập BTC" : "Nhân viên · Ban tổ chức"
                }
                onNavigate={onNavigate}
                accent="staff"
              />
              {adminSignedIn ? (
                <SheetActionLink
                  href={CHECKIN_ADMIN_PROFILE_PATH}
                  icon={UserCircle2}
                  label="Hồ sơ BTC"
                  description="Tài khoản quản trị"
                  onNavigate={onNavigate}
                  accent="staff"
                />
              ) : null}
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-start gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-12 max-w-[min(100vw-7rem,260px)] gap-2 overflow-hidden rounded-xl border-border/80 bg-card px-2 shadow-sm",
              "hover:border-primary/30 hover:bg-card hover:shadow-md",
            )}
            aria-label="Mở menu tài khoản"
          />
        }
      >
        <UserAvatar
          name={name}
          imageUrl={avatarUrl}
          adminActive={showAdmin && adminSignedIn}
        />
        <span className="hidden min-w-0 flex-1 flex-col items-start leading-none sm:flex">
          <span className="flex w-full min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{name}</span>
          </span>
          <span className="mt-1 truncate text-[11px] text-muted-foreground">
            {accountLabel}
            {showAdmin && adminSignedIn ? " · Quản trị" : ""}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground/70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-1.5rem),300px)] rounded-2xl border border-border/70 p-2 shadow-xl"
      >
        <DropdownMenuGroup>
          <div className="flex items-start gap-3 px-2 py-2">
            <UserAvatar
              name={name}
              imageUrl={avatarUrl}
              adminActive={showAdmin && adminSignedIn}
            />
            <AccountIdentity
              name={name}
              email={session.email}
              accountLabel={accountLabel}
            />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Cổng sự kiện
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-lg py-2"
            onClick={() => {
              onNavigate?.()
              router.push(myEventsPath)
            }}
          >
            <ClipboardList className="size-4 text-primary" />
            Sự kiện của tôi
          </DropdownMenuItem>
          {student ? (
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-lg py-2"
              onClick={() => {
                onNavigate?.()
                router.push(getProfilePath(session))
              }}
            >
              <UserCircle2 className="size-4 text-primary" />
              Hồ sơ sinh viên
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        {showAdmin ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Ban tổ chức
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 rounded-lg py-2"
                render={<Link href={adminHref} onClick={onNavigate} />}
              >
                {adminSignedIn ? (
                  <LayoutDashboard className="size-4 text-brand-navy" />
                ) : (
                  <Shield className="size-4 text-brand-navy" />
                )}
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <span className="font-medium">
                    {adminSignedIn ? "Bảng quản trị" : "Đăng nhập quản trị"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {adminSignedIn ? "Đang hoạt động" : "Nhân viên · BTC"}
                  </span>
                </span>
                <ChevronRight className="ml-auto size-4 text-muted-foreground/50" />
              </DropdownMenuItem>
              {adminSignedIn ? (
                <DropdownMenuItem
                  className="cursor-pointer gap-2.5 rounded-lg py-2"
                  render={
                    <Link
                      href={CHECKIN_ADMIN_PROFILE_PATH}
                      onClick={onNavigate}
                    />
                  }
                >
                  <UserCircle2 className="size-4 text-brand-navy" />
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                    <span className="font-medium">Hồ sơ BTC</span>
                    <span className="text-xs text-muted-foreground">
                      Tài khoản quản trị
                    </span>
                  </span>
                  <ChevronRight className="ml-auto size-4 text-muted-foreground/50" />
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer gap-2.5 rounded-lg py-2"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
