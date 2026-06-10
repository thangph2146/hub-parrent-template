import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { LANDING_STATS } from "./data"

export function HeroStatsBar() {
  return (
    <div className="relative z-20 mt-10 w-full lg:mt-12">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {LANDING_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-3.5 text-center sm:py-4"
            >
              <p className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {stat.value}
                {stat.suffix ? (
                  <span className="text-base font-semibold text-white/70">{stat.suffix}</span>
                ) : null}
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/65 sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
