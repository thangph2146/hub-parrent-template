import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"

type EventDetailBreadcrumbProps = {
  title: string
}

export function EventDetailBreadcrumb({ title }: EventDetailBreadcrumbProps) {
  return (
    <section className="border-b border-border bg-muted/40">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={`${STORE_CONTAINER_INSET_WIDE} py-4`}>
        <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href="/su-kien" className="hover:text-foreground">
            Hội nghị - Sự kiện
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="line-clamp-1 font-medium text-foreground">{title}</span>
        </nav>
      </Container>
    </section>
  )
}
