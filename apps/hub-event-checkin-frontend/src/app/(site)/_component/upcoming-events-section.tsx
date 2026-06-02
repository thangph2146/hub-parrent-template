import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@ui/components/button"
import { Container } from "@ui/components/layout"
import { Heading, Text } from "@ui/components/typography"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { EventShowcaseCard } from "./event-showcase-card"
import type { PublicEventItem } from "@/lib/public-events"
import { LANDING_ROUTES } from "./data"

const SHOWCASE_COUNT = 3

type LandingUpcomingEventsSectionProps = {
  events: PublicEventItem[]
}

export function LandingUpcomingEventsSection({ events }: LandingUpcomingEventsSectionProps) {
  const showcase = events.slice(0, SHOWCASE_COUNT)

  return (
    <section className="bg-muted/25 py-14 sm:py-16">
      <Container
        max={STORE_CONTAINER_MAX_DEFAULT}
        className={`${STORE_CONTAINER_INSET_WIDE} space-y-8`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Sự kiện nổi bật
            </p>
            <Heading as="h2" size="section">
              Đừng bỏ lỡ những sự kiện hot
            </Heading>
            <Text variant="muted" className="max-w-xl">
              Đăng ký sớm để giữ chỗ — lịch cập nhật liên tục từ nhà trường.
            </Text>
          </div>
          <Link href={LANDING_ROUTES.events} prefetch={false} className="hidden sm:block">
            <Button className="group rounded-lg">
              Xem toàn bộ lịch
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {showcase.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-8 py-14 text-center">
            <Text className="text-lg font-semibold">Chưa có sự kiện sắp tới</Text>
            <Text variant="muted" className="mt-2">
              Hãy quay lại sau hoặc xem toàn bộ danh mục sự kiện.
            </Text>
            <Link href={LANDING_ROUTES.events} className="mt-6 inline-block">
              <Button className="rounded-lg">Đến trang sự kiện</Button>
            </Link>
          </div>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {showcase.map((event) => (
              <li key={event.id} className="min-w-0">
                <EventShowcaseCard event={event} />
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center sm:hidden">
          <Link href={LANDING_ROUTES.events} prefetch={false} className="w-full max-w-sm">
            <Button variant="outline" className="w-full rounded-lg">
              Xem toàn bộ lịch
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
