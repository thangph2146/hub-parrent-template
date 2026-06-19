"use client"

import { useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Container, Page, PageContent } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { EventsCategorySections } from "./events-category-sections"
import { EventsCodePanel } from "./events-code-panel"
import { EventsFeaturedStrip } from "./events-featured-strip"
import { EventsFilterSidebar } from "./events-filter-sidebar"
import { EventsListPanel } from "./events-list-panel"
import { EventsPageBanner } from "./events-page-banner"
import {
  buildEventsHref,
  parseEventsListQuery,
  type EventsListQuery,
} from "@/lib/site/events-list-query"
import { EVENT_STATUS_LABELS } from "@/lib/site/public-events"
import {
  useEventCategorySections,
  useFeaturedPublicEvents,
  usePublicEventCategories,
  usePublicEventsList,
} from "@/hooks/use-events-catalog"

function buildPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  const pages = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
  const output: Array<number | "ellipsis"> = []
  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index]
    const previous = sorted[index - 1]
    if (previous && value - previous > 1) output.push("ellipsis")
    output.push(value)
  }
  return output
}

export function EventsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = useMemo(
    () => parseEventsListQuery(searchParams),
    [searchParams],
  )

  const applyQuery = useCallback(
    (next: Partial<EventsListQuery>) => {
      const href = buildEventsHref(query, next)
      router.replace(href, { scroll: false })
    },
    [query, router],
  )

  const resetFilters = useCallback(() => {
    router.replace("/su-kien", { scroll: false })
  }, [router])

  const { data: categories = [] } = usePublicEventCategories()

  const showFeatured = query.page === 1 && !query.search
  const showCategoryBrowse =
    query.page === 1 &&
    !query.categorySlug &&
    !query.filter &&
    !query.search &&
    !query.registerable

  const { data: featuredEvents = [] } = useFeaturedPublicEvents(showFeatured)

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = usePublicEventsList(query)

  const validFilter = listData?.validFilter ?? "all"
  const { data: categorySections = [] } = useEventCategorySections(
    categories,
    validFilter,
    showCategoryBrowse,
  )

  const events = listData?.events ?? []
  const meta = listData?.meta ?? {
    page: query.page,
    totalPages: 1,
    total: 0,
    limit: query.limit,
  }
  const pagerItems = buildPaginationItems(meta.page, meta.totalPages)

  const listTitle = query.search
    ? "Kết quả tìm kiếm"
    : query.categorySlug
      ? categories.find((c) => c.slug === query.categorySlug)?.name ?? "Danh sách sự kiện"
      : query.registerable
        ? "Sắp diễn ra · Có thể đăng ký"
        : validFilter !== "all"
          ? EVENT_STATUS_LABELS[validFilter]
          : "Tất cả sự kiện"

  const listSubtitle = query.search
    ? meta.total > 0
      ? `${meta.total} kết quả cho “${query.search}” · Trang ${meta.page}/${meta.totalPages}`
      : `Không có kết quả cho “${query.search}”`
    : meta.total > 0
      ? `${meta.total} sự kiện · Trang ${meta.page}/${meta.totalPages}`
      : query.registerable
        ? "Không có sự kiện sắp diễn ra đang mở đăng ký."
        : "Chưa có sự kiện phù hợp với bộ lọc hiện tại"

  return (
    <Page className="bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.06),transparent_34%),linear-gradient(180deg,hsl(var(--muted)/0.35),transparent_28%)]">
      <PageContent className="p-0">
        <EventsPageBanner
          query={query}
          search={query.search ?? ""}
          onApplyQuery={applyQuery}
        />

        <section className="py-8 sm:py-10">
          <Container
            max={STORE_CONTAINER_MAX_DEFAULT}
            className={`${STORE_CONTAINER_INSET_WIDE} space-y-6`}
          >
            {showFeatured && featuredEvents.length > 0 ? (
              <EventsFeaturedStrip events={featuredEvents} />
            ) : null}

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
              <EventsFilterSidebar
                query={query}
                categories={categories}
                onApplyQuery={applyQuery}
                onResetFilters={resetFilters}
              />

              <div className="min-w-0 flex-1 space-y-5">
                {showCategoryBrowse ? (
                  <EventsCategorySections
                    sections={categorySections}
                    onCategorySelect={(slug) =>
                      applyQuery({ categorySlug: slug, page: 1 })
                    }
                    embedded
                  />
                ) : null}

                <EventsListPanel
                  query={query}
                  listTitle={listTitle}
                  listSubtitle={listSubtitle}
                  events={events}
                  meta={meta}
                  pagerItems={pagerItems}
                  isLoading={isListLoading}
                  isFetching={isListFetching}
                  registerable={!!query.registerable}
                  search={query.search ?? ""}
                  onApplyQuery={applyQuery}
                  onResetFilters={resetFilters}
                />
              </div>
            </div>
          </Container>
        </section>

        <EventsCodePanel />
      </PageContent>
    </Page>
  )
}
