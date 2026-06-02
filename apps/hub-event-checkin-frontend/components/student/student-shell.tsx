"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CalendarDays, Menu, PanelLeft, PanelLeftClose } from "lucide-react"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@ui/components/sheet"
import { Page, PageContent } from "@ui/components/layout"
import { TypographyH2 } from "@ui/components/typography"
import {
  ADMIN_MAIN_SCROLL_CLASS,
  ADMIN_PAGE_CONTENT_CLASS,
  ADMIN_SHEET_NAV_CLASS,
} from "@ui/lib/layout-shell"
import { HeaderAuth } from "@/components/shared/header-auth"
import {
  StudentMobileSidebarPanel,
  StudentSidebar,
} from "@/components/student/student-sidebar"
import { ScrollToTop } from "@/components/student/scroll-to-top"
import {
  buildLoginHref,
  clearEventSession,
  isStudentSession,
  readEventSession,
  subscribeEventSession,
} from "@/lib/event-auth"

const SIDEBAR_COLLAPSED_KEY = "student-sidebar-collapsed"

const HEADER_ICON_BTN_MOBILE = cn(
  "h-11 w-11 min-h-11 min-w-11 shrink-0 rounded-lg border-border/70 bg-background/90 text-muted-foreground shadow-sm",
  "hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow active:scale-[0.98] md:hidden [&_svg]:size-5"
)

const HEADER_ICON_BTN_DESKTOP = cn(
  "hidden h-10 w-10 shrink-0 rounded-lg border-border/70 bg-background/90 text-muted-foreground shadow-sm",
  "hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow active:scale-[0.98] md:inline-flex [&_svg]:size-5"
)

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

function roleSummary(session: {
  roles: Array<{ name: string; displayName?: string }>
}): string {
  const labels = session.roles
    .map((role) => role.displayName || role.name)
    .filter(Boolean)
  if (!labels.length) return "Sinh viên"
  return labels.join(" · ")
}

function AuthLoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const session = useEventSession()
  const [clientReady, setClientReady] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setClientReady(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    try {
      setSidebarCollapsed(
        localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
      )
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        sidebarCollapsed ? "1" : "0"
      )
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!clientReady) return
    if (!session) {
      router.replace(buildLoginHref(pathname || "/student/events"))
      return
    }
    if (!isStudentSession(session)) {
      clearEventSession()
      router.replace(
        `${buildLoginHref(pathname || "/student/events")}&reason=student_only`
      )
    }
  }, [clientReady, pathname, router, session])

  const handleLogout = () => {
    clearEventSession()
    router.replace("/")
    router.refresh()
  }

  if (!clientReady || !session || !isStudentSession(session)) {
    return (
      <AuthLoadingScreen message="Đang kiểm tra phiên đăng nhập sinh viên…" />
    )
  }

  const displayName = displayNameOf(session)
  const avatarUrl = session.image?.trim() || null
  const rolesDisplay = roleSummary(session)

  return (
    <>
      <div className="flex h-screen w-full flex-col bg-background font-sans text-foreground md:flex-row">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            id="student-mobile-nav"
            side="left"
            showCloseButton
            className={ADMIN_SHEET_NAV_CLASS}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menu sinh viên</SheetTitle>
            </SheetHeader>
            <StudentMobileSidebarPanel
              displayName={displayName}
              roleText={rolesDisplay}
              avatarUrl={avatarUrl}
              onNavigate={() => setMobileNavOpen(false)}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>

        <StudentSidebar collapsed={sidebarCollapsed} onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header
            data-student-header="true"
            className="sticky top-0 z-10 flex min-h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/85 px-3 shadow-[0_1px_0_0_hsl(var(--border)/0.4)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:min-h-[4.5rem] sm:px-5 lg:px-6"
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={HEADER_ICON_BTN_MOBILE}
                onClick={() => setMobileNavOpen(true)}
                aria-label="Mở menu sinh viên"
                aria-expanded={mobileNavOpen}
                aria-controls="student-mobile-nav"
              >
                <Menu aria-hidden className="size-5" />
              </Button>
              <TypographyH2 className="shrink-0 truncate text-lg font-bold text-primary sm:text-xl md:hidden">
                HUB Events
              </TypographyH2>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={HEADER_ICON_BTN_DESKTOP}
                onClick={() => setSidebarCollapsed((value) => !value)}
                aria-label={sidebarCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
                title={sidebarCollapsed ? "Mở sidebar" : "Thu gọn sidebar"}
                aria-pressed={!sidebarCollapsed}
              >
                {sidebarCollapsed ? (
                  <PanelLeft aria-hidden className="size-5" />
                ) : (
                  <PanelLeftClose aria-hidden className="size-5" />
                )}
              </Button>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <HeaderAuth />
            </div>
          </header>
          <main className={ADMIN_MAIN_SCROLL_CLASS}>
            <Page as="div">
              <PageContent className={ADMIN_PAGE_CONTENT_CLASS}>
                {children}
              </PageContent>
            </Page>
          </main>
        </div>
      </div>
      <ScrollToTop />
    </>
  )
}
