"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { EventsListQuery } from "@/lib/site/events-list-query"
import { toValidEventFilter } from "@/lib/site/events-list-query"
import {
  filterEventsByTimeStatus,
  getFeaturedPublicEvents,
  getPublicEventCategories,
  getPublicEvents,
  type PublicEventCategoryItem,
  type PublicEventItem,
} from "@/lib/site/public-events"
import type { CategoryWithEvents } from "@/app/(site)/su-kien/_component/events-category-sections"

export const eventsCatalogKeys = {
  categories: () => ["public-events", "categories"] as const,
  featured: () => ["public-events", "featured"] as const,
  list: (query: EventsListQuery) => ["public-events", "list", query] as const,
  categorySections: (filter: string) =>
    ["public-events", "category-sections", filter] as const,
}

const STALE_MS = 5 * 60 * 1000

export function usePublicEventCategories() {
  return useQuery<PublicEventCategoryItem[]>({
    queryKey: eventsCatalogKeys.categories(),
    queryFn: () => getPublicEventCategories(),
    staleTime: STALE_MS,
  })
}

export function useFeaturedPublicEvents(enabled: boolean) {
  return useQuery<PublicEventItem[]>({
    queryKey: eventsCatalogKeys.featured(),
    queryFn: async () => {
      const response = await getFeaturedPublicEvents(12)
      return response.data
    },
    enabled,
    staleTime: STALE_MS,
  })
}

export function usePublicEventsList(query: EventsListQuery) {
  const validFilter = toValidEventFilter(query.filter)

  return useQuery({
    queryKey: eventsCatalogKeys.list(query),
    queryFn: async () => {
      const response = await getPublicEvents({
        page: query.page,
        limit: query.limit,
        filter: validFilter,
        categorySlug: query.categorySlug || undefined,
        search: query.search || undefined,
        registerable: query.registerable || undefined,
      })
      return {
        events: filterEventsByTimeStatus(response.data, validFilter),
        meta: response.meta,
        validFilter,
      }
    },
    placeholderData: keepPreviousData,
  })
}

async function loadCategorySections(
  categories: PublicEventCategoryItem[],
  filter: ReturnType<typeof toValidEventFilter>,
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

export function useEventCategorySections(
  categories: PublicEventCategoryItem[],
  filter: ReturnType<typeof toValidEventFilter>,
  enabled: boolean,
) {
  return useQuery<CategoryWithEvents[]>({
    queryKey: eventsCatalogKeys.categorySections(filter),
    queryFn: () => loadCategorySections(categories, filter),
    enabled: enabled && categories.length > 0,
    staleTime: STALE_MS,
  })
}
