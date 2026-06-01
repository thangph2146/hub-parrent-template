import Link from "next/link"
import { Button } from "@ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@ui/components/empty"
import { Container, Page, PageContent } from "@ui/components/layout"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@ui/components/pagination"
import { Text } from "@ui/components/typography"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { EventsCategorySections, type CategoryWithEvents } from "@/components/events/events-category-sections"
import { EventsCodePanel } from "@/components/events/events-code-panel"
import { EventsFeaturedStrip } from "@/components/events/events-featured-strip"
import { EventsFilterBar } from "@/components/events/events-filter-bar"
import { EventsPageBanner } from "@/components/events/events-page-banner"
import { EventRowCard } from "@/components/events/event-row-card"
import {
  EVENT_STATUS_LABELS,
  getFeaturedPublicEvents,
  getPublicEventCategories,
  getPublicEvents,
  type PublicEventCategoryItem,
} from "@/lib/public-events"

type SearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function toPositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

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

function buildEventsHref(
  current: { filter?: string; categorySlug?: string; page: number; limit: number },
  next: Partial<{ filter: string; categorySlug: string; page: number; limit: number }>,
): string {
  const merged = { ...current, ...next }
  const params = new URLSearchParams()
  if (merged.filter?.trim()) params.set("filter", merged.filter.trim())
  if (merged.categorySlug?.trim()) params.set("categorySlug", merged.categorySlug.trim())
  if (merged.limit > 0) params.set("limit", String(merged.limit))
  if (merged.page > 1) params.set("page", String(merged.page))
  const query = params.toString()
  return query ? `/su-kien?${query}` : "/su-kien"
}

async function loadCategorySections(
  categories: PublicEventCategoryItem[],
  filter: "upcoming" | "ongoing" | "past" | "all",
): Promise<CategoryWithEvents[]> {
  const topCategories = categories.filter((c) => !c.parentId).slice(0, 10)

  return Promise.all(
    topCategories.map(async (category) => {
      try {
        const response = await getPublicEvents({
          categorySlug: category.slug,
          limit: 6,
          filter: filter === "all" ? "upcoming" : filter,
          page: 1,
        })
        return { category, events: response.data }
      } catch {
        return { category, events: [] }
      }
    }),
  )
}

export async function EventsPageContent({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const query = (await searchParams) ?? {}
  const filter = firstValue(query.filter)
  const categorySlug = firstValue(query.categorySlug)
  const page = toPositiveInt(firstValue(query.page), 1)
  const limit = Math.min(24, Math.max(6, toPositiveInt(firstValue(query.limit), 12)))

  const validFilter: "upcoming" | "ongoing" | "past" | "all" = ["upcoming", "ongoing", "past"].includes(
    filter,
  )
    ? (filter as "upcoming" | "ongoing" | "past")
    : "all"

  const [eventResponse, categories, featuredResponse] = await Promise.all([
    getPublicEvents({ page, limit, filter: validFilter, categorySlug: categorySlug || undefined }),
    getPublicEventCategories(),
    page === 1 && !categorySlug ? getFeaturedPublicEvents(12) : Promise.resolve(null),
  ])

  const events = eventResponse.data
  const meta = eventResponse.meta
  const pagerItems = buildPaginationItems(meta.page, meta.totalPages)
  const baseQuery = { filter, categorySlug, page, limit }

  const showFeatured = page === 1 && !categorySlug
  const showCategoryBrowse = page === 1 && !categorySlug && !filter

  const categorySections = showCategoryBrowse
    ? await loadCategorySections(categories, validFilter)
    : []

  const featuredEvents =
    showFeatured && featuredResponse ? featuredResponse.data : []

  const listTitle = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name ?? "Danh sách sự kiện"
    : filter
      ? EVENT_STATUS_LABELS[filter as keyof typeof EVENT_STATUS_LABELS]
      : "Tất cả sự kiện"

  return (
    <Page className="bg-background">
      <PageContent className="p-0">
        <EventsPageBanner />

        {showFeatured ? <EventsFeaturedStrip events={featuredEvents} /> : null}

        <EventsFilterBar
          activeFilter={filter}
          activeCategorySlug={categorySlug}
          categories={categories}
          buildHref={(next) => buildEventsHref(baseQuery, next)}
        />

        {showCategoryBrowse ? (
          <EventsCategorySections
            sections={categorySections}
            buildCategoryHref={(slug) => buildEventsHref(baseQuery, { categorySlug: slug, page: 1 })}
          />
        ) : null}

        <section className="py-10 sm:py-12">
          <Container
            max={STORE_CONTAINER_MAX_DEFAULT}
            className={`${STORE_CONTAINER_INSET_WIDE} space-y-6`}
          >
            <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">{listTitle}</h2>
                <Text variant="small" className="text-muted-foreground">
                  {meta.total > 0
                    ? `${meta.total} sự kiện · Trang ${meta.page}/${meta.totalPages}`
                    : "Chưa có sự kiện phù hợp với bộ lọc hiện tại"}
                </Text>
              </div>
              <div className="flex items-center gap-1 self-start rounded-lg border border-border bg-muted/40 p-1 sm:self-auto">
                {[6, 12, 24].map((limitOption) => (
                  <Link
                    key={limitOption}
                    href={buildEventsHref(baseQuery, { limit: limitOption, page: 1 })}
                    prefetch={false}
                    className={limit === limitOption ? "pointer-events-none" : ""}
                  >
                    <Button
                      variant={limitOption === limit ? "default" : "ghost"}
                      size="sm"
                      className="h-8 rounded-md px-3 text-xs sm:text-sm"
                    >
                      {limitOption}/trang
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {events.length > 0 ? (
              <>
                <div className="grid gap-4">
                  {events.map((event) => (
                    <EventRowCard key={event.id} event={event} />
                  ))}
                </div>

                {meta.totalPages > 1 ? (
                  <Pagination className="justify-center pt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={buildEventsHref(baseQuery, { page: Math.max(1, meta.page - 1) })}
                          text="Trước"
                          aria-disabled={meta.page <= 1}
                          className={meta.page <= 1 ? "pointer-events-none opacity-40" : ""}
                        />
                      </PaginationItem>
                      {pagerItems.map((item, index) => (
                        <PaginationItem key={`${item}-${index}`}>
                          {item === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href={buildEventsHref(baseQuery, { page: item })}
                              isActive={item === meta.page}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href={buildEventsHref(baseQuery, {
                            page: Math.min(meta.totalPages, meta.page + 1),
                          })}
                          text="Sau"
                          aria-disabled={meta.page >= meta.totalPages}
                          className={
                            meta.page >= meta.totalPages ? "pointer-events-none opacity-40" : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                ) : null}
              </>
            ) : (
              <Empty className="rounded-lg border border-dashed">
                <EmptyHeader>
                  <EmptyTitle>Không tìm thấy sự kiện phù hợp</EmptyTitle>
                  <EmptyDescription>
                    Thử đổi bộ lọc hoặc chọn danh mục khác.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link href="/su-kien" prefetch={false}>
                    <Button variant="outline" className="rounded-lg">
                      Đặt lại bộ lọc
                    </Button>
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </Container>
        </section>

        <EventsCodePanel />
      </PageContent>
    </Page>
  )
}
