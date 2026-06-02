"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShieldCheck,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"
import { Button } from "../../button"
import { cn } from "../../../lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../collapsible"
import { useAdminLayout } from "./layout-context"
import type { AdminLayoutUser, AdminMenuLeaf, AdminMenuTreeItem } from "../types"
import {
  getLegacyVisibleMenuLeaves,
  getVisibleMenuItems,
} from "../menu-utils"

function displayNameOf(user: AdminLayoutUser | null): string {
  return user?.name?.trim() || user?.email || "Người dùng HUB"
}

function roleSummaryOf(user: AdminLayoutUser | null): string {
  const labels = (user?.roles ?? [])
    .map((role) => role.displayName || role.name)
    .filter(Boolean)
  if (!labels.length) return "Chưa gán vai trò"
  return labels.join(" · ")
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "HU"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
}

function SidebarLeafLink({
  item,
  isActive,
  collapsed,
  onClick,
  nested = false,
}: {
  item: AdminMenuLeaf
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
  nested?: boolean
}) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      title={item.label}
      onClick={onClick}
      className={cn(
        "group relative flex items-center overflow-hidden rounded-lg transition-all duration-200",
        collapsed
          ? "justify-center px-2 py-3"
          : nested
            ? "gap-3 px-3 py-1"
            : "gap-3 px-3 py-1",
        isActive
          ? nested
            ? "bg-white/20 text-white"
            : "bg-white/20 text-white"
          : "text-white/88 hover:bg-white/15 hover:text-white"
      )}
    >
      {isActive && !collapsed ? (
        <span
          className={cn(
            "absolute left-0 rounded-r-full",
            nested
              ? "inset-y-2.5 w-px bg-white/35"
              : "inset-y-2 w-1 bg-white/85"
          )}
        />
      ) : null}
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          collapsed ? "size-9" : nested ? "size-8" : "size-8"
        )}
      >
        <Icon
          className={cn(
            "shrink-0 transition-transform duration-200 group-hover:scale-105",
            nested ? "size-[1.05rem]" : "size-[1.1rem]"
          )}
        />
      </span>
      {!collapsed && (
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            nested
              ? "text-[0.98rem] font-medium"
              : "text-[1.02rem] font-semibold"
          )}
        >
          {item.label}
        </span>
      )}
    </Link>
  )
}

function isLeafActive(pathname: string, href: string): boolean {
  if (pathname === href) return true
  // Check if pathname starts with href followed by a slash (for detail/edit pages)
  if (pathname.startsWith(`${href}/`)) return true
  return false
}

function isGroupActive(pathname: string, items: AdminMenuLeaf[]): boolean {
  return items.some((item) => isLeafActive(pathname, item.href))
}

function LegacyCollapsedNav({
  visible,
  pathname,
  onLinkClick,
}: {
  visible: AdminMenuLeaf[]
  pathname: string
  onLinkClick?: () => void
}) {
  return (
    <>
      {visible.map((item) => (
        <SidebarLeafLink
          key={item.href}
          item={item}
          isActive={isLeafActive(pathname, item.href)}
          collapsed
          onClick={onLinkClick}
        />
      ))}
    </>
  )
}

function TreeNav({
  visible,
  pathname,
  onLinkClick,
}: {
  visible: AdminMenuTreeItem[]
  pathname: string
  onLinkClick?: () => void
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = {}

      for (const item of visible) {
        if (item.type !== "group") continue
        const isActive = isGroupActive(pathname, item.children)
        next[item.label] = prev[item.label] ?? isActive
        if (isActive) {
          next[item.label] = true
        }
      }

      return next
    })
  }, [pathname, visible])

  return (
    <>
      {visible.map((item) => {
        if (item.type === "leaf") {
          return (
            <SidebarLeafLink
              key={item.href}
              item={item}
              isActive={isLeafActive(pathname, item.href)}
              collapsed={false}
              onClick={onLinkClick}
            />
          )
        }

        const groupActive = isGroupActive(pathname, item.children)
        return (
          <Collapsible
            key={item.label}
            open={openGroups[item.label] ?? groupActive}
            onOpenChange={(open) =>
              setOpenGroups((prev) => ({ ...prev, [item.label]: open }))
            }
            className="rounded-lg"
          >
            <CollapsibleTrigger
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-left transition-all duration-200",
                groupActive
                  ? "mb-1 bg-white/20 text-white"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg"
                )}
              >
                <item.icon className="size-[1.1rem]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[1.02rem] font-semibold">
                  {item.label}
                </p>
                <p className="truncate text-[11px] text-white/55">
                  {item.children.length} mục
                </p>
              </div>
              <ChevronDown className="size-4 shrink-0 text-white/55 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pb-1">
              <div className="ml-4 space-y-1 border-l border-white/12 pl-3">
                {item.children.map((child) => (
                  <SidebarLeafLink
                    key={child.href}
                    item={child}
                    isActive={isLeafActive(pathname, child.href)}
                    collapsed={false}
                    nested
                    onClick={onLinkClick}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </>
  )
}

export function SidebarNavLinks({
  collapsed,
  onLinkClick,
  className,
}: {
  collapsed: boolean
  onLinkClick?: () => void
  className?: string
}) {
  const pathname = usePathname()
  const { user, menuTree } = useAdminLayout()
  const visible = getVisibleMenuItems(user, menuTree)
  const collapsedVisible = getLegacyVisibleMenuLeaves(user, menuTree)

  return (
    <nav
      className={cn(
        "flex-1 overflow-y-auto",
        collapsed ? "p-2" : "p-4",
        className
      )}
    >
      {!collapsed && (
        <div className="px-3 pt-1 pb-2 text-[11px] font-semibold tracking-[0.16em] text-white/52 uppercase">
          Platform
        </div>
      )}
      <div className={cn("space-y-1.5", collapsed ? "" : "space-y-2")}>
        {collapsed ? (
          <LegacyCollapsedNav
            visible={collapsedVisible}
            pathname={pathname}
            onLinkClick={onLinkClick}
          />
        ) : (
          <TreeNav
            visible={visible}
            pathname={pathname}
            onLinkClick={onLinkClick}
          />
        )}
      </div>
    </nav>
  )
}

/** Menu dạng drawer cho màn hình nhỏ (Sheet). */
export function MobileSidebarPanel({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout, siteName, siteDescription } = useAdminLayout()
  const displayName = displayNameOf(user)
  const roleText = roleSummaryOf(user)
  const avatarUrl = user?.image?.trim() || null

  return (
    <div className="flex h-full flex-col bg-primary text-white">
      <div className="shrink-0 px-4 pt-5 pb-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-200 hover:bg-white/15"
          onClick={onNavigate}
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/12 transition-transform duration-200 group-hover:scale-[1.03]">
            <ShieldCheck className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-xl font-bold tracking-tight text-white">
              {siteName}
            </p>
            <p className="truncate text-sm text-white/72">{siteDescription}</p>
          </div>
        </Link>
      </div>
      <SidebarNavLinks collapsed={false} onLinkClick={onNavigate} />
      <div className="mt-auto shrink-0 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3 py-3 shadow-[0_8px_20px_rgba(7,16,48,0.18)]">
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/14 text-sm font-semibold text-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initialsOf(displayName)
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-lg text-white/72 hover:bg-white/15 hover:text-white"
            onClick={() => {
              onNavigate()
              void logout()
            }}
            aria-label="Đăng xuất"
          >
            <LogOut aria-hidden className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

type SidebarProps = {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  const { logout, siteName, siteDescription } = useAdminLayout()

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
          href="/"
          className={cn(
            "group flex transition-all duration-200 hover:bg-white/15",
            collapsed
              ? "justify-center rounded-lg p-2.5"
              : "items-center gap-3 rounded-lg px-2 py-2"
          )}
          title="Tổng quan"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/12 ring-1 ring-white/12 transition-transform duration-200 group-hover:scale-[1.03]">
            <ShieldCheck className="size-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-heading text-[1.7rem] font-bold tracking-tight text-white">
                {siteName}
              </p>
              <p className="truncate text-sm text-white/72">
                {siteDescription}
              </p>
            </div>
          )}
        </Link>
      </div>
      <SidebarNavLinks collapsed={collapsed} />
      <div className={cn("mt-auto shrink-0", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <Button
            type="button"
            title="Đăng xuất"
            aria-label="Đăng xuất"
            onClick={() => logout()}
            variant="ghost"
            className="size-10 rounded-lg text-white/72 hover:bg-white/15 hover:text-white"
          >
            <LogOut aria-hidden className="size-4" />
          </Button>
        ) : (
          <div className="align-center flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/6 shadow-[0_10px_24px_rgba(8,17,52,0.2)]">
            <Button
              type="button"
              aria-label="Đăng xuất"
              onClick={() => logout()}
              variant="ghost"
              className="h-full w-full px-3 py-3"
            >
              <LogOut aria-hidden className="size-4" />
              Đăng xuất
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
