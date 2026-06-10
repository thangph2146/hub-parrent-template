import Link from "next/link"
import { SearchX } from "lucide-react"
import { Button } from "@ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
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
import { EventCatalogCard } from "./event-catalog-card"
import { EventsCategorySections, type CategoryWithEvents } from "./events-category-sections"
import { EventsCodePanel } from "./events-code-panel"
import { EventsFeaturedStrip } from "./events-featured-strip"
import { EventsFilterBar } from "./events-filter-bar"
import { EventsPageBanner } from "./events-page-banner"
import { buildEventsHref } from "@/lib/events-list-query"
import {
  EVENT_STATUS_LABELS,
  filterEventsByTimeStatus,
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
  const queryParams = (await searchParams) ?? {}
  const filter = firstValue(queryParams.filter).trim()
  const categorySlug = firstValue(queryParams.categorySlug)
  const search = firstValue(queryParams.search).trim()
  const page = toPositiveInt(firstValue(queryParams.page), 1)
  const limit = Math.min(24, Math.max(6, toPositiveInt(firstValue(queryParams.limit), 12)))

  const validFilter: "upcoming" | "ongoing" | "past" | "all" = ["upcoming", "ongoing", "past"].includes(
    filter,
  )
    ? (filter as "upcoming" | "ongoing" | "past")
    : "all"

  const listQuery = { filter, categorySlug, search, page, limit }

  const [eventResponse, categories, featuredResponse] = await Promise.all([
    getPublicEvents({
      page,
      limit,
      filter: validFilter,
      categorySlug: categorySlug || undefined,
      search: search || undefined,
    }),
    getPublicEventCategories(),
    page === 1 && !categorySlug && !search && !filter
      ? getFeaturedPublicEvents(12)
      : Promise.resolve(null),
  ])

  const events = filterEventsByTimeStatus(eventResponse.data, validFilter)
  const meta = eventResponse.meta
  const pagerItems = buildPaginationItems(meta.page, meta.totalPages)

  const showFeatured =
    page === 1 && !categorySlug && !search && !filter
  const showCategoryBrowse = page === 1 && !categorySlug && !filter && !search

  const categorySections = showCategoryBrowse
    ? await loadCategorySections(categories, validFilter)
    : []

  const featuredEvents =
    showFeatured && featuredResponse ? featuredResponse.data : []

  const listTitle = search
    ? `Kết quả tìm kiếm`
    : categorySlug
      ? categories.find((c) => c.slug === categorySlug)?.name ?? "Danh sách sự kiện"
      : validFilter !== "all"
        ? EVENT_STATUS_LABELS[validFilter]
        : "Tất cả sự kiện"

  const listSubtitle = search
    ? meta.total > 0
      ? `${meta.total} kết quả cho “${search}” · Trang ${meta.page}/${meta.totalPages}`
      : `Không có kết quả cho “${search}”`
    : meta.total > 0
      ? `${meta.total} sự kiện · Trang ${meta.page}/${meta.totalPages}`
      : "Chưa có sự kiện phù hợp với bộ lọc hiện tại"

  return (
    <Page className="bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.06),transparent_34%),linear-gradient(180deg,hsl(var(--muted)/0.35),transparent_28%)]">
      <PageContent className="p-0">
        <EventsPageBanner />

        <EventsFilterBar query={listQuery} categories={categories} />

        {showFeatured ? <EventsFeaturedStrip events={featuredEvents} /> : null}

        {showCategoryBrowse ? (
          <EventsCategorySections
            sections={categorySections}
            buildCategoryHref={(slug) =>
              buildEventsHref(listQuery, { categorySlug: slug, page: 1 })
            }
          />
        ) : null}

        <section className="py-10 sm:py-12">
          <Container
            max={STORE_CONTAINER_MAX_DEFAULT}
            className={`${STORE_CONTAINER_INSET_WIDE} space-y-6`}
          >
            <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  {listTitle}
                </h2>
                <Text variant="small" className="text-muted-foreground">
                  {listSubtitle}
                </Text>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {search ? (
                  <Link href={buildEventsHref(listQuery, { search: "", page: 1 })} prefetch={false}>
                    <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs">
                      Xóa tìm kiếm
                    </Button>
                  </Link>
                ) : null}
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
                  {[6, 12, 24].map((limitOption) => (
                    <Link
                      key={limitOption}
                      href={buildEventsHref(listQuery, { limit: limitOption, page: 1 })}
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
            </div>

            {events.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <EventCatalogCard key={event.id} event={event} />
                  ))}
                </div>

                {meta.totalPages > 1 ? (
                  <Pagination className="justify-center pt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={buildEventsHref(listQuery, { page: Math.max(1, meta.page - 1) })}
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
                              href={buildEventsHref(listQuery, { page: item })}
                              isActive={item === meta.page}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href={buildEventsHref(listQuery, {
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
              <Empty className="rounded-2xl border border-dashed bg-card/60 py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchX className="size-5" />
                  </EmptyMedia>
                  <EmptyTitle>Không tìm thấy sự kiện phù hợp</EmptyTitle>
                  <EmptyDescription>
                    {search
                      ? "Thử từ khóa khác hoặc bỏ bộ lọc để xem thêm sự kiện."
                      : "Thử đổi bộ lọc hoặc chọn danh mục khác."}
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
