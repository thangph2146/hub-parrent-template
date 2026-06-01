import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE } from "@ui/lib/layout-shell"

export function EventsPageBanner() {
  return (
    <section className="border-b border-white/10 bg-secondary text-secondary-foreground">
      <Container max={"full"} className={`${STORE_CONTAINER_INSET_WIDE} py-8 sm:py-10`}>
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-white/70">
          <Link href="/" className="transition-colors hover:text-white">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="font-medium text-white">Hội nghị - Sự kiện</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Hội nghị - Sự kiện</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
          Hãy đến và tham gia cùng chúng tôi — khám phá các hoạt động, hội thảo và sự kiện tại HUB.
        </p>
      </Container>
    </section>
  )
}
