"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { EventsSearchForm } from "./events-search-form"
import type { EventsListQuery } from "@/lib/site/events-list-query"

type EventsPageBannerProps = {
  query: EventsListQuery
  search: string
  onApplyQuery?: (next: Partial<EventsListQuery>) => void
}

export function EventsPageBanner({ query, search, onApplyQuery }: EventsPageBannerProps) {  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-secondary text-secondary-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.22),transparent_45%)]"
        aria-hidden
      />
      <Container
        max={STORE_CONTAINER_MAX_DEFAULT}
        className={`${STORE_CONTAINER_INSET_WIDE} relative py-8 sm:py-10`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <nav className="flex flex-wrap items-center gap-1 text-sm text-white/70">
              <Link href="/" className="transition-colors hover:text-white">
                Trang chủ
              </Link>
              <ChevronRight className="size-3.5 shrink-0" />
              <span className="font-medium text-white">Hội nghị - Sự kiện</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">
              HUB Events
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Hội nghị - Sự kiện
            </h1>
            <p className="max-w-2xl text-sm text-white/80 sm:text-base">
              Lọc theo trạng thái và danh mục ở sidebar — sự kiện nổi bật hiển thị phía trên.
            </p>
          </div>
          <div className="w-full shrink-0 sm:max-w-md">
            <EventsSearchForm
              initialSearch={search}
              query={query}
              tone="banner"
              onApplyQuery={onApplyQuery}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
