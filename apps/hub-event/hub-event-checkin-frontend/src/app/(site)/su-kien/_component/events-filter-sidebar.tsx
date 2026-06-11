"use client"

import {
  CalendarDays,
  ClipboardCheck,
  FilterX,
  Layers,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { cn } from "@ui/lib/utils"
import { EVENT_STATUS_LABELS, type PublicEventCategoryItem } from "@/lib/public-events"
import type { EventsListQuery } from "@/lib/events-list-query"

type EventsFilterSidebarProps = {
  query: EventsListQuery
  categories: PublicEventCategoryItem[]
  onApplyQuery: (next: Partial<EventsListQuery>) => void
  onResetFilters: () => void
}

const STATUS_OPTIONS = [
  { key: "", label: "Tất cả", icon: CalendarDays },
  ...Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => ({
    key,
    label,
    icon: CalendarDays,
  })),
] as const

const REGISTERABLE_OPTIONS = [
  { key: false, label: "Tất cả sắp diễn ra" },
  { key: true, label: "Có thể đăng ký" },
] as const

function EventsFilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Badge
      render={<button type="button" onClick={onClick} />}
      variant={active ? "promo" : "muted"}
      size="sm"
      className="cursor-pointer"
    >
      {label}
    </Badge>
  )
}

export function EventsFilterSidebar({
  query,
  categories,
  onApplyQuery,
  onResetFilters,
}: EventsFilterSidebarProps) {
  const {
    filter: activeFilter = "",
    categorySlug: activeCategorySlug,
    search,
    registerable,
  } = query
  const showRegisterableOptions = activeFilter === "upcoming"

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []
  if (activeFilter) {
    activeChips.push({
      key: "filter",
      label: EVENT_STATUS_LABELS[activeFilter as keyof typeof EVENT_STATUS_LABELS] ?? activeFilter,
      onRemove: () => onApplyQuery({ filter: "", page: 1, registerable: false }),
    })
  }
  if (registerable) {
    activeChips.push({
      key: "registerable",
      label: "Có thể đăng ký",
      onRemove: () => onApplyQuery({ registerable: false, page: 1 }),
    })
  }
  if (activeCategorySlug) {
    const catName =
      categories.find((c) => c.slug === activeCategorySlug)?.name ?? activeCategorySlug
    activeChips.push({
      key: "category",
      label: `DM: ${catName}`,
      onRemove: () => onApplyQuery({ categorySlug: "", page: 1 }),
    })
  }
  if (search?.trim()) {
    const term = search.trim()
    activeChips.push({
      key: "search",
      label: `“${term.slice(0, 24)}${term.length > 24 ? "…" : ""}”`,
      onRemove: () => onApplyQuery({ search: "", page: 1 }),
    })
  }

  const hasActiveFilters = activeChips.length > 0

  return (
    <aside
      className="w-full shrink-0 lg:sticky lg:top-28 lg:w-72 lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto xl:w-80"
      aria-label="Bộ lọc sự kiện"
    >
      <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-5">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Trạng thái
          </p>
          <nav
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
            aria-label="Lọc theo trạng thái"
          >
            {STATUS_OPTIONS.map((option) => {
              const Icon = option.icon
              const isActive = activeFilter === option.key
              return (
                <button
                  key={option.key || "all"}
                  type="button"
                  onClick={() =>
                    onApplyQuery({
                      filter: option.key,
                      page: 1,
                      registerable: option.key === "upcoming" ? registerable : false,
                    })
                  }
                  className={cn(
                    "flex w-full shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-all lg:px-3.5",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/60 bg-background text-muted-foreground hover:border-primary/20 hover:bg-muted/40",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{option.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {showRegisterableOptions ? (
          <div className="border-t border-border/50 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <ClipboardCheck className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="text-sm font-bold text-foreground">Đăng ký</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {REGISTERABLE_OPTIONS.map((option) => (
                <EventsFilterPill
                  key={String(option.key)}
                  active={registerable === option.key}
                  label={option.label}
                  onClick={() => onApplyQuery({ registerable: option.key, page: 1 })}
                />
              ))}
            </div>
          </div>
        ) : null}

        {categories.length > 0 ? (
          <div className="border-t border-border/50 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="text-sm font-bold text-foreground">Danh mục</span>
            </div>
            <nav
              className="flex max-h-52 flex-col gap-1 overflow-y-auto pr-1 lg:max-h-64"
              aria-label="Lọc theo danh mục"
            >
              <button
                type="button"
                onClick={() => onApplyQuery({ categorySlug: "", page: 1 })}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors",
                  !activeCategorySlug
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                Tất cả danh mục
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onApplyQuery({ categorySlug: cat.slug, page: 1 })}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors",
                    activeCategorySlug === cat.slug
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>
        ) : null}

        {hasActiveFilters ? (
          <div className="space-y-2 border-t border-border/50 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" aria-hidden />
                <Badge variant="muted" size="sm">
                  Đang lọc
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs text-muted-foreground"
                onClick={onResetFilters}
              >
                <FilterX className="size-3.5" />
                Xóa hết
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <Badge
                  key={chip.key}
                  render={<button type="button" onClick={chip.onRemove} />}
                  variant="category"
                  size="sm"
                  shape="pill"
                  className="cursor-pointer gap-1"
                >
                  {chip.label}
                  <X className="size-3" aria-hidden />
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
