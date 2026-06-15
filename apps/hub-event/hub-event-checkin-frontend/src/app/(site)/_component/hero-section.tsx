"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, QrCode } from "lucide-react"
import { Badge } from "@ui/components/badge"
import { Button } from "@ui/components/button"
import { ContainerTextFlip } from "@ui/components/container-text-flip"
import { Container } from "@ui/components/layout"
import { Heading } from "@ui/components/typography"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { HeroProductMockup } from "./hero-product-mockup"
import type { PublicEventItem } from "@/lib/site/public-events"
import { SITE_BRAND } from "@/lib/site/site-nav"
import { LANDING_HERO, LANDING_HERO_BADGES, LANDING_ROUTES } from "./data"

type LandingHeroSectionProps = {
  featuredEvent?: PublicEventItem | null
}

export function LandingHeroSection({ featuredEvent = null }: LandingHeroSectionProps) {
  const { eyebrow, title, flipWords, backgroundImage } = LANDING_HERO

  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="landing-hero-pattern relative min-h-[min(92vh,880px)]">
        <div className="absolute inset-0">
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            fill
            priority
            unoptimized
            quality={85}
            sizes="100vw"
            className="object-cover object-[center_35%] scale-105"
          />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-br from-secondary/100 via-secondary/90 to-black/70"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(255,255,255,0.08),transparent)]"
          aria-hidden
        />

        <Container
          max={STORE_CONTAINER_MAX_DEFAULT}
          className={`${STORE_CONTAINER_INSET_WIDE} relative z-10 flex min-h-[min(92vh,880px)] flex-col justify-center py-12 lg:py-16`}
        >
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-primary px-3 py-0.5 text-primary-foreground hover:bg-primary">
                  {SITE_BRAND.name}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-white/30 bg-white/5 text-white/90"
                >
                  {eyebrow}
                </Badge>
              </div>

              <div className="space-y-4">
                <Heading
                  as="h1"
                  className="text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
                >
                  <span className="block">{title}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                    <span className="text-lg font-medium text-white/75 sm:text-xl">
                      cùng
                    </span>
                    <ContainerTextFlip
                      words={[...flipWords]}
                      interval={3000}
                      className="min-h-[1.35em] rounded-lg border border-white/25 bg-white/15 px-3 py-0.5 shadow-sm"
                      textClassName="text-xl font-bold text-white sm:text-2xl"
                    />
                  </span>
                </Heading>
                <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                  Khám phá sự kiện, đăng ký một chạm và mang vé QR đến cổng check-in —
                  trải nghiệm sinh viên HUB gọn gàng trên một nền tảng.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {LANDING_HERO_BADGES.map((badge) => (
                  <span
                    key={badge.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs text-white/90 backdrop-blur-sm"
                  >
                    <badge.icon className="size-3.5 text-white/70" />
                    {badge.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link href={LANDING_ROUTES.events}>
                  <Button
                    size="lg"
                    className="h-11 rounded-lg px-6 font-semibold shadow-lg shadow-primary/25"
                  >
                    <CalendarDays className="size-4" />
                    Khám phá sự kiện
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href={LANDING_ROUTES.ticketLookup}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 rounded-lg border-white/30 bg-white/5 px-6 font-semibold text-white hover:bg-white/10 hover:text-white"
                  >
                    <QrCode className="size-4" />
                    Tra cứu vé
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full lg:justify-self-end">
              <HeroProductMockup featuredEvent={featuredEvent} />
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
