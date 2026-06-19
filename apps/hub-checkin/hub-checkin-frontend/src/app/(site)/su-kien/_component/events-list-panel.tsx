"use client"

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
import { cn } from "@ui/lib/utils"
import { EventCatalogCard } from "./event-catalog-card"
import type { EventsListQuery } from "@/lib/site/events-list-query"
import type { PublicEventItem } from "@/lib/site/public-events"

type EventsListPanelProps = {
  query: EventsListQuery
  listTitle: string
  listSubtitle: string
  events: PublicEventItem[]
  meta: { page: number; totalPages: number; total: number }
  pagerItems: Array<number | "ellipsis">
  isLoading: boolean
  isFetching: boolean
  registerable: boolean
  search: string
  onApplyQuery: (next: Partial<EventsListQuery>) => void
  onResetFilters: () => void
}

function EventsListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-2xl bg-muted/40"
          aria-hidden
        />
      ))}
    </div>
  )
}

export function EventsListPanel({
  query,
  listTitle,
  listSubtitle,
  events,
  meta,
  pagerItems,
  isLoading,
  isFetching,
  registerable,
  search,
  onApplyQuery,
  onResetFilters,
}: EventsListPanelProps) {
  const { limit } = query

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">{listTitle}</h2>
          <Text variant="small" className="text-muted-foreground">
            {listSubtitle}
            {isFetching && !isLoading ? (
              <span className="ml-2 text-xs text-primary">(đang cập nhật…)</span>
            ) : null}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background/80 p-1">
            {[6, 12, 24].map((limitOption) => (
              <Button
                key={limitOption}
                type="button"
                variant={limitOption === limit ? "default" : "ghost"}
                size="sm"
                className="h-8 rounded-md px-3 text-xs sm:text-sm"
                disabled={isFetching && limitOption === limit}
                onClick={() => onApplyQuery({ limit: limitOption, page: 1 })}
              >
                {limitOption}/trang
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative transition-opacity duration-200",
          isFetching && !isLoading && "opacity-60",
        )}
      >
        {isLoading ? (
          <EventsListSkeleton />
        ) : events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCatalogCard key={event.id} event={event} />
              ))}
            </div>

            {meta.totalPages > 1 ? (
              <Pagination className="justify-center pt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text="Trước"
                      aria-disabled={meta.page <= 1 || isFetching}
                      className={cn(
                        meta.page <= 1 || isFetching
                          ? "pointer-events-none opacity-40"
                          : "cursor-pointer",
                      )}
                      onClick={(event) => {
                        event.preventDefault()
                        if (meta.page <= 1 || isFetching) return
                        onApplyQuery({ page: Math.max(1, meta.page - 1) })
                      }}
                    />
                  </PaginationItem>
                  {pagerItems.map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {item === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={item === meta.page}
                          className={isFetching ? "pointer-events-none" : "cursor-pointer"}
                          onClick={(event) => {
                            event.preventDefault()
                            if (isFetching) return
                            onApplyQuery({ page: item })
                          }}
                        >
                          {item}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text="Sau"
                      aria-disabled={meta.page >= meta.totalPages || isFetching}
                      className={cn(
                        meta.page >= meta.totalPages || isFetching
                          ? "pointer-events-none opacity-40"
                          : "cursor-pointer",
                      )}
                      onClick={(event) => {
                        event.preventDefault()
                        if (meta.page >= meta.totalPages || isFetching) return
                        onApplyQuery({
                          page: Math.min(meta.totalPages, meta.page + 1),
                        })
                      }}
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
                  : registerable
                    ? "Thử bỏ lọc đăng ký hoặc chọn trạng thái khác."
                    : "Thử đổi bộ lọc hoặc chọn danh mục khác."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={onResetFilters}
              >
                Đặt lại bộ lọc
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  )
}
