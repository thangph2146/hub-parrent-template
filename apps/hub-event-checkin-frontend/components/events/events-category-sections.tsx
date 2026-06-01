import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@ui/components/button"
import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import type { PublicEventCategoryItem, PublicEventItem } from "@/lib/public-events"
import { EventRowCard } from "./event-row-card"

export type CategoryWithEvents = {
  category: PublicEventCategoryItem
  events: PublicEventItem[]
}

type EventsCategorySectionsProps = {
  sections: CategoryWithEvents[]
  buildCategoryHref: (categorySlug: string) => string
}

export function EventsCategorySections({ sections, buildCategoryHref }: EventsCategorySectionsProps) {
  const visible = sections.filter((s) => s.events.length > 0)

  if (visible.length === 0) return null

  return (
    <section className="border-b border-border bg-background py-10 sm:py-12">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={`${STORE_CONTAINER_INSET_WIDE} space-y-10`}>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">Danh mục sự kiện</h2>
          <p className="text-sm text-muted-foreground">
            Khám phá sự kiện theo từng lĩnh vực tại Trường Đại học Ngân hàng TP. HCM.
          </p>
        </div>

        {visible.map(({ category, events }) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
              <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
              <Link href={buildCategoryHref(category.slug)}>
                <Button variant="ghost" size="sm" className="group shrink-0 rounded-lg text-primary">
                  Xem thêm
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-3">
              {events.slice(0, 5).map((event) => (
                <EventRowCard key={event.id} event={event} compact />
              ))}
            </div>
          </div>
        ))}
      </Container>
    </section>
  )
}
