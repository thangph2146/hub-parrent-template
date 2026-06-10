import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@ui/components/button"
import { Container } from "@ui/components/layout"
import { Heading, Text } from "@ui/components/typography"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { LANDING_ROUTES, LANDING_STEPS } from "./data"

export function LandingHowItWorksSection() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <Container
        max={STORE_CONTAINER_MAX_DEFAULT}
        className={`${STORE_CONTAINER_INSET_WIDE} space-y-10`}
      >
        <div className="mx-auto max-w-4xl space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">3 bước đơn giản</p>
          <Heading as="h2" size="section">
            Tham gia sự kiện chưa bao giờ dễ đến thế
          </Heading>
          <Text variant="muted">Không cần giấy tờ rườm rà — chỉ cần điện thoại và tài khoản sinh viên.</Text>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {LANDING_STEPS.map((item, index) => (
            <div
              key={item.step}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <Text variant="small" className="mt-2 text-muted-foreground">
                {item.description}
              </Text>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href={LANDING_ROUTES.events}>
            <Button size="lg" className="rounded-lg px-8">
              Bắt đầu khám phá
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
