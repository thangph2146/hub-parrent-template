import Link from "next/link"
import { cn } from "@ui/lib/utils"
import { EVENT_STATUS_LABELS, type PublicEventCategoryItem } from "@/lib/public-events"

type EventsFilterBarProps = {
  activeFilter: string
  activeCategorySlug: string
  categories: PublicEventCategoryItem[]
  buildHref: (
    next: Partial<{ filter: string; categorySlug: string; page: number }>,
  ) => string
}

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  ...Object.entries(EVENT_STATUS_LABELS).map(([key, label]) => ({ key, label })),
] as const

export function EventsFilterBar({
  activeFilter,
  activeCategorySlug,
  categories,
  buildHref,
}: EventsFilterBarProps) {
  return (
    <div className="sticky top-[6.5rem] z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto w-full max-w-[1440px] space-y-4 px-6 py-4 md:px-12">
        <nav
          className="inline-flex w-full max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
          aria-label="Lọc theo trạng thái"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = activeFilter === tab.key
            return (
              <Link
                key={tab.key || "all"}
                href={buildHref({ filter: tab.key, page: 1 })}
                prefetch={false}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>

        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ categorySlug: "", page: 1 })}
              prefetch={false}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                !activeCategorySlug
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              Tất cả danh mục
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildHref({ categorySlug: cat.slug, page: 1 })}
                prefetch={false}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                  activeCategorySlug === cat.slug
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border/80 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
