"use client"

import {
  ChevronDown,
  ClipboardList,
  LogIn,
  LogOut,
  UserCircle2,
} from "lucide-react"
import { HeaderActionTile } from "@/components/shared/header-action-tile"
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
import { useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  buildLoginHref,
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
    () => null
  )
}

function displayNameOf(session: {
  name?: string | null
  email: string
}): string {
  return session.name?.trim() || session.email
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "SV"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function UserAvatar({
  name,
  imageUrl,
  className,
  fallbackClassName,
}: {
  name: string
  imageUrl: string | null
  className?: string
  fallbackClassName?: string
}) {
  return (
    <Avatar
      className={cn("size-9 aspect-square shrink-0 after:rounded-lg", className)}
    >
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt="" className="rounded-lg" />
      ) : null}
      <AvatarFallback
        className={cn(
          "rounded-lg bg-primary/10 text-[11px] font-bold text-primary",
          fallbackClassName
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

function LoginTriggerLink({ href }: { href: string }) {
  return (
    <HeaderActionTile
      href={href}
      icon={LogIn}
      title="Đăng nhập"
      subtitle="Sinh viên · Khách"
      variant="portal"
      ariaLabel="Đăng nhập để quản lý sự kiện"
    />
  )
}

export function HeaderAuth() {
  const session = useEventSession()
  const pathname = usePathname()
  const router = useRouter()

  if (session) {
    const name = displayNameOf(session)
    const avatarUrl = session.image?.trim() || null
    const student = isStudentSession(session)
    const accountLabel = getEventAccountLabel(session)
    const myEventsPath = getMyEventsPath(session)

    const handleLogout = () => {
      clearEventSession()
      if (isEventPortalPath(pathname) || isEventAuthLoginPath(pathname)) {
        router.replace("/")
        router.refresh()
        return
      }
      window.location.reload()
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-12 min-w-0 max-w-[min(100vw-8rem,280px)] gap-2 overflow-hidden rounded-xl px-2.5 sm:px-3 py-2"
              aria-label="Mở menu tài khoản"
            />
          }
        >
          <UserAvatar name={name} imageUrl={avatarUrl} />
          <div className="hidden min-w-0 flex-1 flex-col items-start gap-0.5 overflow-hidden sm:flex">
            <span className="flex w-full min-w-0 items-center gap-1.5">
              <span className="min-w-0 truncate text-sm font-medium">{name}</span>
              <Badge
                variant="secondary"
                className="h-5 shrink-0 px-1.5 text-[10px]"
              >
                {accountLabel}
              </Badge>
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {session.email}
            </span>
          </div>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 rounded-xl p-2">
          <div className="mb-1 px-2 py-1.5">
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{session.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg"
              onClick={() => router.push(myEventsPath)}
            >
              <ClipboardList className="size-4 text-muted-foreground" />
              Sự kiện của tôi
            </DropdownMenuItem>
            {student ? (
              <DropdownMenuItem
                className="cursor-pointer gap-2 rounded-lg"
                onClick={() => router.push(getProfilePath(session))}
              >
                <UserCircle2 className="size-4 text-muted-foreground" />
                Hồ sơ sinh viên
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-destructive focus:text-destructive"
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

  const loginHref = buildLoginHref(pathname || "/")
  return <LoginTriggerLink href={loginHref} />
}
