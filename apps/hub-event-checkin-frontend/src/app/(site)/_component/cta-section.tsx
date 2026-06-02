import Link from "next/link"
import { ArrowRight, Ticket } from "lucide-react"
import { Button } from "@ui/components/button"
import { Container } from "@ui/components/layout"
import { Heading, Text } from "@ui/components/typography"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { LANDING_ROUTES } from "./data"

export function LandingCtaSection() {
  return (
    <section className="border-t border-primary/10 bg-secondary py-14 sm:py-16">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
        <div className="overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-black/5">
          <div className="px-6 py-10 text-center sm:px-12 sm:py-12">
            <Heading as="h2" size="section" className="text-foreground">
              Sẵn sàng cho sự kiện tiếp theo?
            </Heading>
            <Text variant="muted" className="mx-auto mt-3 max-w-xl text-base">
              Khám phá lịch sự kiện, đăng ký tham dự và check-in QR — mọi thứ trong một nền tảng
              dành cho sinh viên HUB.
            </Text>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link href={LANDING_ROUTES.events} className="sm:min-w-[200px]">
                <Button size="lg" className="h-11 w-full rounded-lg px-6 font-semibold sm:w-auto">
                  <Ticket className="size-4" />
                  Danh sách sự kiện
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
