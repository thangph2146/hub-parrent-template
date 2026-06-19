import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Container } from "@ui/components/layout"
import { STORE_CONTAINER_INSET_WIDE, STORE_CONTAINER_MAX_DEFAULT } from "@ui/lib/layout-shell"
import { LANDING_QUICK_ACTIONS } from "@/lib/site/site-nav"

export function LandingQuickActions() {
  return (
    <section className="relative z-10 -mt-6 pb-2 sm:-mt-8">
      <Container max={STORE_CONTAINER_MAX_DEFAULT} className={STORE_CONTAINER_INSET_WIDE}>
        <div className="grid gap-3 sm:grid-cols-3">
          {LANDING_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-md transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground group-hover:text-primary">{action.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{action.description}</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
