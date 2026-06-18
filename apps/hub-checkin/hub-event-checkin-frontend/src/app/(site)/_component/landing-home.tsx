import { LandingCtaSection } from "./cta-section"
import { LandingHeroSection } from "./hero-section"
import { LandingHowItWorksSection } from "./how-it-works-section"
import { LandingIntroSection } from "./intro-section"
import { LandingMarqueeSection } from "./marquee-section"
import { LandingQuickActions } from "./landing-quick-actions"
import { LandingUpcomingEventsSection } from "./upcoming-events-section"
import { getFeaturedPublicEvents, getPublicEvents, type PublicEventItem } from "@/lib/site/public-events"

function mergeFeaturedWithUpcoming(
  featured: PublicEventItem[],
  upcoming: PublicEventItem[],
  max: number,
): PublicEventItem[] {
  const seen = new Set(featured.map((e) => e.id))
  const merged = [...featured]
  for (const event of upcoming) {
    if (merged.length >= max) break
    if (!seen.has(event.id)) merged.push(event)
  }
  return merged.slice(0, max)
}

export async function LandingHome() {
  let featuredEvent: PublicEventItem | null = null
  let showcaseEvents: PublicEventItem[] = []

  try {
    const [featuredRes, upcomingRes] = await Promise.all([
      getFeaturedPublicEvents(12),
      getPublicEvents({ filter: "upcoming", limit: 12, page: 1 }),
    ])
    const featuredList = featuredRes.data
    featuredEvent = featuredList[0] ?? upcomingRes.data[0] ?? null
    showcaseEvents = mergeFeaturedWithUpcoming(featuredList, upcomingRes.data, 3)
  } catch {
    featuredEvent = null
    showcaseEvents = []
  }

  return (
    <div className="bg-background">
      <LandingHeroSection featuredEvent={featuredEvent} />
      <LandingQuickActions />
      <LandingUpcomingEventsSection events={showcaseEvents} />
      <LandingMarqueeSection />
      <LandingHowItWorksSection />
      <LandingIntroSection />
      <LandingCtaSection />
    </div>
  )
}
