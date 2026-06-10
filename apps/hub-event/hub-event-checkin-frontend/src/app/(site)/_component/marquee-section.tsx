import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { LANDING_MARQUEE_TAGS } from "./data"

export function LandingMarqueeSection() {
  const tags = [...LANDING_MARQUEE_TAGS, ...LANDING_MARQUEE_TAGS]

  return (
    <section className="border-b border-border bg-muted/30 py-3" aria-label="Loại sự kiện">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
        <div className="landing-marquee-mask relative overflow-hidden">
          <div className="landing-marquee-track flex w-max gap-2">
            {tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex shrink-0 items-center rounded-md border border-border/80 bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
