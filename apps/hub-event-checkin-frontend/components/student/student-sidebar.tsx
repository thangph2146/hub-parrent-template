"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ChevronsUpDown,
  ClipboardList,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@ui/lib/utils"

type StudentNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { href: "/student/events", label: "Sự kiện của tôi", icon: ClipboardList },
  { href: "/su-kien", label: "Khám phá sự kiện", icon: CalendarDays },
]

const SITE_NAME = "HUB Events"
const SITE_DESCRIPTION = "Cổng sinh viên"

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/student") return pathname === "/student"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "SV"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function StudentSidebarLeafLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: StudentNavItem
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onClick}
      className={cn(
        "group relative flex items-center overflow-hidden rounded-lg transition-all duration-200",
        collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-1",
        isActive
          ? "bg-white/20 text-white"
          : "text-white/88 hover:bg-white/15 hover:text-white"
      )}
    >
      {isActive && !collapsed ? (
        <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-white/85" />
      ) : null}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          collapsed ? "size-9" : "size-8"
        )}
      >
        <Icon className="size-[1.1rem] shrink-0 transition-transform duration-200 group-hover:scale-105" />
      </span>
      {!collapsed ? (
        <span className="min-w-0 flex-1 truncate text-[1.02rem] font-semibold">
          {item.label}
        </span>
      ) : null}
    </Link>
  )
}

export function StudentSidebarNavLinks({
  collapsed,
  onLinkClick,
  className,
}: {
  collapsed: boolean
  onLinkClick?: () => void
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex-1 overflow-y-auto",
        collapsed ? "p-2" : "p-4",
        className
      )}
    >
      {!collapsed ? (
        <div className="px-3 pt-1 pb-2 text-[11px] font-semibold tracking-[0.16em] text-white/52 uppercase">
          Sinh viên
        </div>
      ) : null}
      <div className={cn("space-y-1.5", collapsed ? "" : "space-y-2")}>
        {STUDENT_NAV_ITEMS.map((item) => (
          <StudentSidebarLeafLink
            key={item.href}
            item={item}
            isActive={isNavActive(pathname, item.href)}
            collapsed={collapsed}
            onClick={onLinkClick}
          />
        ))}
      </div>
    </nav>
  )
}

export function StudentMobileSidebarPanel({
  displayName,
  roleText,
  avatarUrl,
  onNavigate,
}: {
  displayName: string
  roleText: string
  avatarUrl: string | null
  onNavigate: () => void
  onLogout: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-primary text-white">
      <div className="shrink-0 px-4 pt-5 pb-4">
        <Link
          href="/student"
          className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-200 hover:bg-white/15"
          onClick={onNavigate}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/12 transition-transform duration-200 group-hover:scale-[1.03]">
            <GraduationCap className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-xl font-bold tracking-tight text-white">
              {SITE_NAME}
            </p>
            <p className="truncate text-sm text-white/72">{SITE_DESCRIPTION}</p>
          </div>
        </Link>
      </div>
      <StudentSidebarNavLinks collapsed={false} onLinkClick={onNavigate} />
      <div className="mt-auto shrink-0 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3 py-3 shadow-[0_8px_20px_rgba(7,16,48,0.18)]">
          <Link
            href="/student/profile"
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/14 text-sm font-semibold text-white">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                initials(displayName)
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">
                {displayName}
              </p>
              <p className="truncate text-sm text-white/68">{roleText}</p>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-white/50" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function StudentSidebar({
  collapsed,
  onLogout,
}: {
  collapsed: boolean
  onLogout: () => void
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-[#1A2D65] bg-primary text-white transition-[width] duration-300 ease-out md:flex",
        collapsed ? "w-[4.5rem]" : "w-80"
      )}
    >
      <div
        className={cn(
          "shrink-0",
          collapsed ? "flex justify-center px-2 py-3" : "px-4 pt-5 pb-4"
        )}
      >
        <Link
          href="/student"
          className={cn(
            "group flex transition-all duration-200 hover:bg-white/15",
            collapsed
              ? "justify-center rounded-lg p-2.5"
              : "items-center gap-3 rounded-lg px-2 py-2"
          )}
          title="Tổng quan"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/12 transition-transform duration-200 group-hover:scale-[1.03]">
            <GraduationCap className="size-5 text-white" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate font-heading text-[1.7rem] font-bold tracking-tight text-white">
                {SITE_NAME}
              </p>
              <p className="truncate text-sm text-white/72">{SITE_DESCRIPTION}</p>
            </div>
          ) : null}
        </Link>
      </div>
      <StudentSidebarNavLinks collapsed={collapsed} />
    </aside>
  )
}
