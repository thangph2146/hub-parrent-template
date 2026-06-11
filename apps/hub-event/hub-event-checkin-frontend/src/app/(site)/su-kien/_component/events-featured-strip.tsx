"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@ui/components/button"
import { EventFeaturedCard } from "./event-featured-card"
import type { PublicEventItem } from "@/lib/public-events"
import { LANDING_ROUTES } from "../../_component/data"

type EventsFeaturedStripProps = {
  events: PublicEventItem[]
}

export function EventsFeaturedStrip({ events }: EventsFeaturedStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (events.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction === "left" ? -340 : 340, behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden py-8">
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5" />
              Được đánh dấu nổi bật
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sự kiện nổi bật
            </h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              Hãy đến và tham gia với chúng tôi — các sự kiện được nhà trường ưu tiên giới thiệu.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={LANDING_ROUTES.events} prefetch={false} className="hidden sm:block">
              <Button variant="outline" size="sm" className="rounded-lg">
                Xem tất cả
              </Button>
            </Link>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-lg bg-card/80"
                onClick={() => scroll("left")}
                aria-label="Cuộn trái"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-lg bg-card/80"
                onClick={() => scroll("right")}
                aria-label="Cuộn phải"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory overflow-x-auto pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {events.map((event) => (
            <div key={event.id} className="snap-start">
              <EventFeaturedCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
