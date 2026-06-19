"use client"

import Link from "next/link"
import { ChevronDown, LayoutDashboard, LogOut, UserCircle2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"
import { cn } from "@ui/lib/utils"
import {
  CHECKIN_ADMIN_HOME_PATH,
  CHECKIN_ADMIN_PROFILE_PATH,
  isCheckinAdminShellPath,
} from "@/config/admin/checkin-admin-access"
import { useAdminSession } from "@/components/shared/use-admin-session"
import {
  ADMIN_SESSION_EVENT,
  clearAdminSession,
} from "@/lib/admin/auth-session"

function displayNameOf(user: {
  name?: string | null
  email: string
}): string {
  return user.name?.trim() || user.email
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "BQ"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

type HeaderStaffAccountMenuProps = {
  layout?: "bar" | "sheet"
  onNavigate?: () => void
}

export function HeaderStaffAccountMenu({
  layout = "bar",
  onNavigate,
}: HeaderStaffAccountMenuProps) {
  const adminUser = useAdminSession()
  const pathname = usePathname()
  const router = useRouter()

  if (!adminUser) return null

  const name = displayNameOf(adminUser)
  const avatarUrl = adminUser.image?.trim() || null
  const inAdmin = isCheckinAdminShellPath(pathname)

  const handleLogout = () => {
    clearAdminSession()
    window.dispatchEvent(new Event(ADMIN_SESSION_EVENT))
    onNavigate?.()
    if (isCheckinAdminShellPath(pathname)) {
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
          <Avatar className="size-9 aspect-square after:rounded-lg">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt="" className="rounded-lg" />
            ) : null}
            <AvatarFallback className="rounded-lg bg-brand-navy/10 text-[11px] font-bold text-brand-navy">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {adminUser.email}
            </p>
            <Badge variant="secondary" className="mt-2 h-5 px-1.5 text-[10px]">
              Ban quản trị
            </Badge>
          </div>
        </div>
        <div className="grid gap-2">
          {!inAdmin ? (
            <Link
              href={CHECKIN_ADMIN_HOME_PATH}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl border border-brand-navy/20 bg-brand-navy/[0.04] px-3 py-2.5"
            >
              <LayoutDashboard className="size-4 text-brand-navy" />
              <span className="text-sm font-medium">Tổng quan</span>
            </Link>
          ) : null}
          <Link
            href={CHECKIN_ADMIN_PROFILE_PATH}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5"
          >
            <UserCircle2 className="size-4 text-brand-navy" />
            <span className="text-sm font-medium">Hồ sơ của tôi</span>
          </Link>
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
            aria-label="Mở menu ban quản trị"
          />
        }
      >
        <Avatar className="size-9 aspect-square after:rounded-lg">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="" className="rounded-lg" />
          ) : null}
          <AvatarFallback className="rounded-lg bg-brand-navy/10 text-[11px] font-bold text-brand-navy">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 flex-1 flex-col items-start leading-none sm:flex">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="mt-1 truncate text-[11px] text-muted-foreground">
            Ban quản trị
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
            <Avatar className="size-9 aspect-square after:rounded-lg">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="" className="rounded-lg" />
              ) : null}
              <AvatarFallback className="rounded-lg bg-brand-navy/10 text-[11px] font-bold text-brand-navy">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {adminUser.email}
              </p>
              <Badge variant="secondary" className="mt-2 h-5 px-1.5 text-[10px]">
                Ban quản trị
              </Badge>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {!inAdmin ? (
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 rounded-lg py-2"
              render={
                <Link href={CHECKIN_ADMIN_HOME_PATH} onClick={onNavigate} />
              }
            >
              <LayoutDashboard className="size-4 text-brand-navy" />
              Tổng quan
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-lg py-2"
            render={
              <Link href={CHECKIN_ADMIN_PROFILE_PATH} onClick={onNavigate} />
            }
          >
            <UserCircle2 className="size-4 text-brand-navy" />
            Hồ sơ của tôi
          </DropdownMenuItem>
        </DropdownMenuGroup>
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
