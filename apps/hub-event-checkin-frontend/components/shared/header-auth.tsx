"use client"

import Link from "next/link"
import {
  ChevronDown,
  ClipboardList,
  LogIn,
  LogOut,
  UserCircle2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/avatar"
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
import { useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  buildLoginHref,
  clearEventSession,
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

function roleLine(session: {
  roles: Array<{ name: string; displayName?: string }>
}): string {
  const labels = session.roles
    .map((role) => role.displayName || role.name)
    .filter(Boolean)
  if (!labels.length) return "Sinh viên"
  return labels.join(" · ")
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

export function HeaderAuth() {  const session = useEventSession()
  const pathname = usePathname()
  const router = useRouter()

  if (session) {
    const name = displayNameOf(session)
    const avatarUrl = session.image?.trim() || null
    const student = isStudentSession(session)

    const handleLogout = () => {
      clearEventSession()
      if (pathname.startsWith("/student")) {
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
              className="h-12 max-w-[min(100vw-8rem,260px)] gap-2 rounded-lg px-2.5 sm:px-3"
              aria-label="Mở menu tài khoản"
            />
          }
        >
          <UserAvatar name={name} imageUrl={avatarUrl} />
          <div className="flex flex-col items-start gap-0.5">
          <span className="truncate text-sm font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {session.email}
            </span>
          </div>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {student ? (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => router.push("/student/profile")}
                >
                  <UserCircle2 className="size-4 text-muted-foreground" />
                  Hồ sơ sinh viên
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => router.push("/student/events")}
                >
                  <ClipboardList className="size-4 text-muted-foreground" />
                  Sự kiện của tôi
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
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

  return (
    <Link href={buildLoginHref(pathname || "/")} className="hidden sm:block">
      <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg">
        <LogIn className="size-4" />
        Đăng nhập
      </Button>
    </Link>
  )
}
