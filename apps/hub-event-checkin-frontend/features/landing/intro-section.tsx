import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@ui/components/button"
import { Container } from "@ui/components/layout"
import { Heading, Text } from "@ui/components/typography"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { SITE_BRAND } from "@/lib/site-nav"
import { LANDING_INTRO, LANDING_ROUTES } from "./data"

export function LandingIntroSection() {
  return (
    <section className="border-y border-border bg-background py-16 sm:py-20">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="space-y-5 p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {LANDING_INTRO.heading}
              </p>
              <Heading as="h2" size="section" className="text-balance">
                {LANDING_INTRO.subheading}
              </Heading>
              <Text className="leading-relaxed text-muted-foreground">{LANDING_INTRO.body}</Text>
              <ul className="grid gap-3 sm:grid-cols-1">
                {LANDING_INTRO.highlights.map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <item.icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link href={LANDING_ROUTES.events}>
                <Button className="group rounded-lg">
                  Xem lịch sự kiện
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-col justify-center bg-secondary p-8 text-center text-white sm:p-10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                {SITE_BRAND.school}
              </p>
              <div className="my-6 space-y-1 text-3xl font-bold leading-tight sm:text-4xl">
                <p>
                  H<span className="text-white/70">eightening</span>
                </p>
                <p>
                  U<span className="text-white/70">nique</span>
                </p>
                <p>
                  B<span className="text-white/70">rilliance</span>
                </p>
              </div>
              <p className="text-sm italic text-white/85">{LANDING_INTRO.quote}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
