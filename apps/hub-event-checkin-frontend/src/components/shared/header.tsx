"use client"

import { useMemo, useState } from "react"
import { useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Menu } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ui/components/sheet"
import { cn } from "@ui/lib/utils"
import { Logo } from "@/components/icons/logo"
import { HeaderAuth } from "@/components/shared/header-auth"
import { HeaderAdminLink } from "@/components/shared/header-admin-link"
import {
  getMyEventsPath,
  isEventPortalSession,
  readEventSession,
  subscribeEventSession,
} from "@/lib/event-auth"
import { MAIN_NAV, MY_EVENTS_NAV, SITE_BRAND, isNavActive } from "@/lib/site-nav"

function useEventSession() {
  return useSyncExternalStore(
    subscribeEventSession,
    readEventSession,
    () => null
  )
}

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const session = useEventSession()
  const navItems = useMemo(() => {
    const items = [...MAIN_NAV]
    if (session && isEventPortalSession(session)) {
      items.push({
        ...MY_EVENTS_NAV,
        href: getMyEventsPath(session),
      })
    }
    return items
  }, [session])

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-white/10 bg-secondary text-xs text-white/80">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-6 md:px-12">
          <span className="truncate">
            Nền tảng sự kiện chính thức · {SITE_BRAND.school}
          </span>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <CalendarDays className="size-3.5" />
            Đăng ký · Check-in QR
          </span>
        </div>
      </div>

      <div className="border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6 md:px-12">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <Logo className="h-9 w-9 sm:h-10 sm:w-10" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-bold text-foreground">
                {SITE_BRAND.name}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {SITE_BRAND.tagline}
              </div>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Điều hướng chính"
          >
            {navItems.map((link) => {
              const active = isNavActive(pathname, link.href)
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-1 sm:rounded-2xl sm:border sm:border-border/70 sm:bg-muted/20 sm:p-1 sm:shadow-sm">
              <HeaderAdminLink />
              <span
                className="hidden h-5 w-px shrink-0 bg-border/70 sm:block"
                aria-hidden
              />
              <HeaderAuth />
            </div>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted md:hidden"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
                <SheetHeader>
                  <SheetTitle>{SITE_BRAND.name}</SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-1 px-4"
                  aria-label="Menu di động"
                >
                  {navItems.map((link) => {
                    const active = isNavActive(pathname, link.href)
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-start gap-3 rounded-lg px-3 py-3 transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        <Icon className="mt-0.5 size-5 shrink-0" />
                        <div>
                          <p className="font-semibold">{link.label}</p>
                          {link.description ? (
                            <p className="text-xs text-muted-foreground">
                              {link.description}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-4 space-y-3 border-t border-border px-4 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Tài khoản
                  </p>
                  <div className="grid gap-2">
                    <HeaderAuth />
                    <HeaderAdminLink inMenu />
                  </div>
                  <Link
                    href="/su-kien"
                    onClick={() => setMenuOpen(false)}
                    className="block pt-1"
                  >
                    <Button className="w-full rounded-xl">
                      Xem tất cả sự kiện
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
