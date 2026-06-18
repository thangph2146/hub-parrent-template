"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  Home,
  Menu,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeft,
  Sun,
  UserCircle2,
} from "lucide-react"
import { Button } from "../../button"
import { cn } from "../../../lib/utils"
import { useAdminRouteProgress } from "../../../lib/admin-route-progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../sheet"
import { MobileSidebarPanel, Sidebar } from "./sidebar"
import { ThemeToggle } from "../../theme-toggle"
import { Page, PageContent } from "../../layout"
import { TypographyH2 } from "../../typography"
import { useTextSize } from "../../text-size-provider"
import { useTheme } from "../../theme-provider"
import { ScrollToTop } from "../../scroll-to-top"
import { useAdminLayout } from "./layout-context"
import { AdminAuthLoadingScreen } from "./admin-auth-loading-screen"
import {
  ADMIN_HEADER_ROLE_LINE_CLASS,
  ADMIN_MAIN_SCROLL_CLASS,
  ADMIN_PAGE_CONTENT_CLASS,
  ADMIN_SHEET_NAV_CLASS,
} from "../../../lib/layout-shell"

const HEADER_ICON_BTN_MOBILE = cn(
  "h-11 min-h-11 w-11 min-w-11 shrink-0 rounded-lg border-border/70 bg-background/90 text-muted-foreground shadow-sm",
  "hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow active:scale-[0.98] md:hidden [&_svg]:size-5"
)

const HEADER_ICON_BTN_DESKTOP = cn(
  "hidden h-10 w-10 shrink-0 rounded-lg border-border/70 bg-background/90 text-muted-foreground shadow-sm",
  "hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow active:scale-[0.98] md:inline-flex [&_svg]:size-5"
)

const HEADER_PROFILE_TRIGGER = cn(
  "group relative inline-flex min-h-12 min-w-12 items-center gap-3 rounded-lg border border-border/70 bg-background/95 px-2.5 py-1.5 pr-3 text-left shadow-sm ring-1 ring-black/5 backdrop-blur-xl",
  "transition-all duration-200 hover:-translate-y-px hover:border-primary/25 hover:bg-primary/[0.04] hover:shadow-md",
  "aria-expanded:border-primary/25 aria-expanded:bg-primary/[0.05] aria-expanded:shadow-md",
  "focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none supports-[backdrop-filter]:bg-background/75"
)

const HEADER_PROFILE_AVATAR = cn(
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-gradient-to-br from-primary/15 to-primary/5",
  "text-sm font-extrabold tracking-wide text-primary shadow-inner transition-all duration-200",
  "group-hover:border-primary/25 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:shadow-sm",
  "group-aria-expanded:border-primary/25 group-aria-expanded:from-primary/20 group-aria-expanded:to-primary/10"
)

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (p.length === 0) return "?"
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase()
  return `${p[0]![0] ?? ""}${p[p.length - 1]![0] ?? ""}`.toUpperCase()
}

function roleSummary(user: {
  roles: { name: string; displayName?: string }[]
}): string {
  if (!user.roles.length) return "Chưa gán vai trò"
  return user.roles.map((r) => r.displayName || r.name).join(" · ")
}

export function AdminShell({
  children,
  classMain,
  isSidebar = true,
}: {
  children: ReactNode
  classMain?: string
  isSidebar?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { startIfNavigating } = useAdminRouteProgress()
  const {
    user,
    clientReady,
    siteName,
    siteDescription,
    brandingReady,
    loginPath,
    isAuthPath,
    canAccessApp,
    clearSession,
    sessionEventName,
    mobileHeaderTitle = "B2B Admin",
    fullWidthPaths = ["/graph"],
    homePath = "/",
    profilePath = "/profile",
    publicSitePath,
    publicSiteLabel = "Trang chủ",
    accessDeniedReason = "staff_only",
  } = useAdminLayout()
  const { theme, setTheme } = useTheme()
  const { size, setSize } = useTextSize()
  const displayName = user?.name?.trim() || user?.email || "Người dùng HUB"
  const avatarUrl = user?.image?.trim() || null
  const onAuthRoute = isAuthPath(pathname)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Force editor toolbar sticky via JS to overcome any CSS specificity issues
  useEffect(() => {
    const forceToolbarSticky = () => {
      document
        .querySelectorAll<HTMLElement>(".editor-toolbar")
        .forEach((el) => {
          el.style.setProperty("position", "sticky", "important")
          el.style.setProperty("top", "0px", "important")
        })
    }
    forceToolbarSticky()
    const timer = setTimeout(forceToolbarSticky, 500)
    const observer = new MutationObserver(forceToolbarSticky)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!clientReady) return

    if (onAuthRoute) {
      if (user && canAccessApp(user)) {
        router.replace(homePath)
        return
      }
      if (user && !canAccessApp(user)) {
        clearSession()
        window.dispatchEvent(new Event(sessionEventName))
        router.replace(`${loginPath}?reason=${accessDeniedReason}`)
      }
      return
    }

    if (!user) {
      router.replace(loginPath)
      return
    }
    if (!canAccessApp(user)) {
      clearSession()
      window.dispatchEvent(new Event(sessionEventName))
      router.replace(`${loginPath}?reason=${accessDeniedReason}`)
    }
  }, [
    accessDeniedReason,
    canAccessApp,
    clearSession,
    clientReady,
    homePath,
    loginPath,
    onAuthRoute,
    router,
    sessionEventName,
    user,
  ])

  if (onAuthRoute) {
    if (!clientReady) {
      return (
        <AdminAuthLoadingScreen
          message="Đang tải…"
          siteName={brandingReady ? siteName : undefined}
          siteDescription={brandingReady ? siteDescription : undefined}
        />
      )
    }
    if (user && canAccessApp(user)) {
      return (
        <AdminAuthLoadingScreen
          message="Đang chuyển về bảng điều khiển…"
          siteName={brandingReady ? siteName : undefined}
          siteDescription={brandingReady ? siteDescription : undefined}
        />
      )
    }
    return (
      <>
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-border bg-background/90 p-0.5 shadow-sm backdrop-blur-sm">
          <ThemeToggle />
        </div>
        {children}
      </>
    )
  }

  if (!clientReady || !user) {
    return (
      <AdminAuthLoadingScreen
        message="Đang tải…"
        siteName={brandingReady ? siteName : undefined}
        siteDescription={brandingReady ? siteDescription : undefined}
      />
    )
  }

  const rolesDisplay = roleSummary(user)

  return (
    <>
      <div className="fixed inset-0 flex min-h-0 w-full flex-col overflow-hidden bg-background font-sans text-foreground md:flex-row">
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent
            id="admin-mobile-nav"
            side="left"
            showCloseButton
            className={ADMIN_SHEET_NAV_CLASS}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Menu điều hướng</SheetTitle>
            </SheetHeader>
            <MobileSidebarPanel onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        {isSidebar && <Sidebar collapsed={sidebarCollapsed} />}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header
            data-admin-header="true"
            className="sticky top-0 z-10 flex min-h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/85 px-3 shadow-[0_1px_0_0_hsl(var(--border)/0.4)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:min-h-[4.5rem] sm:px-5 lg:px-6"
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={HEADER_ICON_BTN_MOBILE}
                onClick={() => setMobileNavOpen(true)}
                aria-label="Mở menu điều hướng"
                aria-expanded={mobileNavOpen}
                aria-controls="admin-mobile-nav"
              >
                <Menu aria-hidden className="size-5" />
              </Button>
              <TypographyH2 className="shrink-0 truncate text-lg font-bold text-primary sm:text-xl md:hidden">
                {mobileHeaderTitle}
              </TypographyH2>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={HEADER_ICON_BTN_DESKTOP}
                onClick={() => setSidebarCollapsed((c) => !c)}
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
            <div className="flex items-center gap-2 sm:gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className={HEADER_PROFILE_TRIGGER}
                      aria-label="Mở menu tài khoản và tuỳ chỉnh giao diện"
                    />
                  }
                >
                  <div className="hidden min-w-0 text-right sm:block">
                    <p className="max-w-[220px] truncate text-sm leading-none font-bold text-foreground">
                      {displayName}
                    </p>
                    <p
                      className={cn(
                        ADMIN_HEADER_ROLE_LINE_CLASS,
                        "mt-1 max-w-[220px] truncate text-[11px] text-muted-foreground/90"
                      )}
                      title={rolesDisplay}
                    >
                      {rolesDisplay}
                    </p>
                  </div>
                  <div className={HEADER_PROFILE_AVATAR}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="size-full rounded-lg object-cover"
                      />
                    ) : (
                      initials(displayName)
                    )}
                  </div>
                  <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180 sm:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            className="size-full rounded-lg object-cover"
                          />
                        ) : (
                          initials(displayName)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {displayName}
                        </p>
                        <p
                          className="truncate text-xs text-muted-foreground"
                          title={rolesDisplay}
                        >
                          {rolesDisplay}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {publicSitePath ? (
                      <DropdownMenuItem
                        className="cursor-pointer rounded-md px-2 py-1.5"
                        onClick={() => {
                          startIfNavigating(publicSitePath)
                          router.push(publicSitePath)
                        }}
                      >
                        <Home className="size-4 text-muted-foreground" />
                        {publicSiteLabel}
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem
                      className="cursor-pointer rounded-md px-2 py-1.5"
                      onClick={() => {
                        startIfNavigating(profilePath)
                        router.push(profilePath)
                      }}
                    >
                      <UserCircle2 className="size-4 text-muted-foreground" />
                      Hồ sơ
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <div className="space-y-2 px-2 py-1">
                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Tuỳ chỉnh
                    </p>
                    <DropdownMenuRadioGroup
                      value={theme}
                      onValueChange={(value) =>
                        setTheme(value as "light" | "dark" | "system")
                      }
                    >
                      <div className="grid grid-cols-3 gap-1">
                        <DropdownMenuRadioItem
                          value="light"
                          title="Sáng"
                          className="cursor-pointer justify-center rounded-md border border-border px-2 py-1.5"
                        >
                          <Sun className="size-4 text-muted-foreground" />
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="dark"
                          title="Tối"
                          className="cursor-pointer justify-center rounded-md border border-border px-2 py-1.5"
                        >
                          <Moon className="size-4 text-muted-foreground" />
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="system"
                          title="Theo hệ thống"
                          className="cursor-pointer justify-center rounded-md border border-border px-2 py-1.5"
                        >
                          <Monitor className="size-4 text-muted-foreground" />
                        </DropdownMenuRadioItem>
                      </div>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuRadioGroup
                      value={size}
                      onValueChange={(value) =>
                        setSize(value as "sm" | "base" | "lg")
                      }
                    >
                      <div className="grid grid-cols-3 gap-1">
                        <DropdownMenuRadioItem
                          value="sm"
                          className="cursor-pointer justify-center rounded-md border border-border px-2 py-1.5 text-xs font-bold"
                        >
                          S
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="base"
                          className="cursor-pointer justify-center rounded-md border border-border px-2 py-1.5 text-xs font-bold"
                        >
                          M
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="lg"
                          className="cursor-pointer justify-center rounded-md border border-border px-2 py-1.5 text-xs font-bold"
                        >
                          L
                        </DropdownMenuRadioItem>
                      </div>
                    </DropdownMenuRadioGroup>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className={cn(ADMIN_MAIN_SCROLL_CLASS, classMain)}>
            {fullWidthPaths.includes(pathname) ? (
              children
            ) : (
              <Page as="div">
                <PageContent className={ADMIN_PAGE_CONTENT_CLASS}>
                  {children}
                </PageContent>
              </Page>
            )}
          </main>
        </div>
      </div>
      <ScrollToTop />
    </>
  )
}
