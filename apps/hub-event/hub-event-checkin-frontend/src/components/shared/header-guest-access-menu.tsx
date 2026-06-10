"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  Shield,
} from "lucide-react"
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
import { HeaderAccessOptionCard } from "@/components/shared/header-access-option-card"
import {
  CHECKIN_ADMIN_HOME_PATH,
  CHECKIN_ADMIN_LOGIN_PATH,
} from "@/config/admin/checkin-admin-access"
import { useAdminSession } from "@/components/shared/use-admin-session"
import { buildLoginHref, readEventSession } from "@/lib/event-auth"

type GuestAccessOptionsProps = {
  showAdmin: boolean
  onNavigate?: () => void
  className?: string
}

export function HeaderGuestAccessOptions({
  showAdmin,
  onNavigate,
  className,
}: GuestAccessOptionsProps) {
  const pathname = usePathname()
  const adminUser = useAdminSession()

  const portalHref = buildLoginHref(pathname || "/")
  const portalSignedIn = Boolean(readEventSession())
  const adminSignedIn = Boolean(adminUser)
  const adminHref = adminSignedIn
    ? CHECKIN_ADMIN_HOME_PATH
    : CHECKIN_ADMIN_LOGIN_PATH

  return (
    <div className={cn("grid gap-2", className)}>
      {!portalSignedIn ? (
      <HeaderAccessOptionCard
        href={portalHref}
        icon={LogIn}
        title="Đăng nhập sự kiện"
        subtitle="Sinh viên · Khách"
        variant="portal"
        ariaLabel="Đăng nhập để quản lý sự kiện"
        onClick={onNavigate}
      />
      ) : null}
      {showAdmin && !adminSignedIn ? (
        <HeaderAccessOptionCard
          href={adminHref}
          icon={adminSignedIn ? LayoutDashboard : Shield}
          title={adminSignedIn ? "Tổng quan" : "Đăng nhập quản trị"}
          subtitle="Ban quản trị"
          variant="staff"
          ariaLabel={
            adminSignedIn
              ? "Vào bảng quản trị sự kiện"
              : "Đăng nhập quản trị sự kiện"
          }
          showStatusDot={adminSignedIn}
          onClick={onNavigate}
        />
      ) : null}
    </div>
  )
}

type HeaderGuestAccessDropdownProps = {
  showAdmin: boolean
}

export function HeaderGuestAccessDropdown({
  showAdmin,
}: HeaderGuestAccessDropdownProps) {
  const pathname = usePathname()
  const adminUser = useAdminSession()
  const adminSignedIn = Boolean(adminUser)
  const portalHref = buildLoginHref(pathname || "/")
  const portalSignedIn = Boolean(readEventSession())
  const adminHref = adminSignedIn
    ? CHECKIN_ADMIN_HOME_PATH
    : CHECKIN_ADMIN_LOGIN_PATH

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-10 gap-1.5 rounded-xl border-border/80 bg-card px-3 shadow-sm",
              "hover:border-primary/30 hover:bg-card hover:shadow-md",
            )}
            aria-label="Mở menu đăng nhập"
          />
        }
      >
        <LogIn className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="text-sm font-semibold text-foreground">Đăng nhập</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground/70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(calc(100vw-1.5rem),280px)] rounded-2xl border border-border/70 p-2 shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Cổng sự kiện
          </DropdownMenuLabel>
          {!portalSignedIn ? (
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-lg py-2"
              render={<Link href={portalHref} />}
            >
              <LogIn className="size-4 text-primary" aria-hidden />
              <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                <span className="font-medium">Đăng nhập</span>
                <span className="text-xs text-muted-foreground">
                  Sinh viên · Khách
                </span>
              </span>
              <ChevronRight className="ml-auto size-4 text-muted-foreground/50" />
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>

        {showAdmin && !adminSignedIn ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Ban quản trị
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 rounded-lg py-2"
                render={<Link href={adminHref} />}
              >
                {adminSignedIn ? (
                  <LayoutDashboard
                    className="size-4 text-brand-navy"
                    aria-hidden
                  />
                ) : (
                  <Shield className="size-4 text-brand-navy" aria-hidden />
                )}
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                  <span className="font-medium">
                    {adminSignedIn ? "Tổng quan" : "Đăng nhập quản trị"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Ban quản trị
                  </span>
                </span>
                <ChevronRight className="ml-auto size-4 text-muted-foreground/50" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
