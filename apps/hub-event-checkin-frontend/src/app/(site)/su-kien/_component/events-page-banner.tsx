import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"

export function EventsPageBanner() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-secondary text-secondary-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.22),transparent_45%)]"
        aria-hidden
      />
      <Container
        max={STORE_CONTAINER_MAX_DEFAULT}
        className={`${STORE_CONTAINER_INSET_WIDE} relative py-8 sm:py-10`}
      >
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-white/70">
          <Link href="/" className="transition-colors hover:text-white">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="font-medium text-white">Hội nghị - Sự kiện</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Hội nghị - Sự kiện
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
          Khám phá hội thảo, workshop và hoạt động ngoại khóa tại HUB — lọc theo
          trạng thái, danh mục hoặc tìm nhanh theo tên và địa điểm.
        </p>
      </Container>
    </section>
  )
}
