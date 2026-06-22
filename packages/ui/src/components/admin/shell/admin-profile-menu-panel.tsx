"use client"

import type { LucideIcon } from "lucide-react"
import {
  ExternalLink,
  Home,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Type,
  UserCircle2,
} from "lucide-react"
import { cn } from "../../../lib/utils"
import { useTextSize } from "../../text-size-provider"
import { useTheme } from "../../theme-provider"

const TEXT_SIZE_OPTIONS = [
  { value: "sm", label: "Nhỏ", sampleClass: "text-[11px]" },
  { value: "base", label: "Vừa", sampleClass: "text-sm" },
  { value: "lg", label: "Lớn", sampleClass: "text-base" },
] as const

type TextSizeValue = (typeof TEXT_SIZE_OPTIONS)[number]["value"]

const THEME_OPTIONS = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Hệ thống", icon: Monitor },
] as const

type ThemeValue = (typeof THEME_OPTIONS)[number]["value"]

function MenuSectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  )
}

function MenuAccountLink({
  label,
  description,
  icon: Icon,
  external = false,
  active = false,
  onClick,
  destructive = false,
}: {
  label: string
  description: string
  icon: LucideIcon
  external?: boolean
  active?: boolean
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors",
        active
          ? "bg-primary/5"
          : destructive
            ? "text-destructive hover:border-destructive/20 hover:bg-destructive/5"
            : "hover:border-border/60 hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
          active
            ? "border-primary/30 bg-primary/10 text-primary"
            : destructive
              ? "border-destructive/20 bg-destructive/5 text-destructive"
              : "border-border/70 bg-background text-muted-foreground"
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {label}
          {external ? (
            <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
          ) : null}
        </span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  )
}

export function AdminProfileMenuPanel({
  displayName,
  rolesDisplay,
  avatarUrl,
  avatarFallback,
  publicSitePath,
  publicSiteLabel = "Trang chủ",
  profilePath,
  profileActive = false,
  onNavigate,
  onLogout,
}: {
  displayName: string
  rolesDisplay: string
  avatarUrl: string | null
  avatarFallback: string
  publicSitePath?: string
  publicSiteLabel?: string
  profilePath: string
  profileActive?: boolean
  onNavigate: (path: string) => void
  onLogout: () => void
}) {
  const { theme, resolved, setTheme } = useTheme()
  const { size, setSize } = useTextSize()

  return (
    <>
      <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              avatarFallback
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground" title={rolesDisplay}>
              {rolesDisplay}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-2">
        <section>
          <MenuSectionTitle>Tài khoản</MenuSectionTitle>
          <div className="space-y-0.5">
            {publicSitePath ? (
              <MenuAccountLink
                label={publicSiteLabel}
                description="Quay về trang công khai"
                icon={Home}
                external
                onClick={() => onNavigate(publicSitePath)}
              />
            ) : null}
            <MenuAccountLink
              label="Hồ sơ"
              description="Cập nhật thông tin cá nhân"
              icon={UserCircle2}
              active={profileActive}
              onClick={() => onNavigate(profilePath)}
            />
            <MenuAccountLink
              label="Đăng xuất"
              description="Kết thúc phiên làm việc"
              icon={LogOut}
              destructive
              onClick={onLogout}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-muted/20 p-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-primary">
              {resolved === "dark" ? (
                <Moon className="size-4" aria-hidden />
              ) : (
                <Sun className="size-4" aria-hidden />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Giao diện</p>
              <p className="truncate text-xs text-muted-foreground">
                Chọn sáng, tối hoặc theo hệ thống
              </p>
            </div>
          </div>
          <div
            role="radiogroup"
            aria-label="Giao diện"
            className="grid grid-cols-3 gap-2"
          >
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon
              const isActive = theme === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setTheme(option.value as ThemeValue)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/70 bg-background text-foreground hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {option.label}
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-muted/20 p-2">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md border border-border/70 bg-background text-primary">
              <Type className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Cỡ chữ</p>
              <p className="truncate text-xs text-muted-foreground">Chọn kích thước dễ đọc</p>
            </div>
          </div>
          <div role="radiogroup" aria-label="Cỡ chữ" className="grid grid-cols-3 gap-2">
            {TEXT_SIZE_OPTIONS.map((option) => {
              const isActive = size === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setSize(option.value as TextSizeValue)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/70 bg-background text-foreground hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "font-bold leading-none",
                      option.sampleClass,
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    Aa
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
