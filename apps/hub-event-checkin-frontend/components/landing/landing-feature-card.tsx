import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { cn } from "@ui/lib/utils"

type LandingFeatureCardProps = {
  icon: LucideIcon
  title: string
  description: string
  href?: string
  accent: "primary" | "secondary" | "navy" | "warm"
  className?: string
}

const ACCENT = {
  primary: {
    icon: "bg-primary text-primary-foreground shadow-primary/20",
    glow: "from-primary/15",
    ring: "group-hover:ring-primary/20",
    link: "text-primary",
  },
  secondary: {
    icon: "bg-secondary text-secondary-foreground shadow-secondary/20",
    glow: "from-secondary/15",
    ring: "group-hover:ring-secondary/25",
    link: "text-secondary",
  },
  navy: {
    icon: "bg-brand-navy text-white shadow-brand-navy/20",
    glow: "from-brand-navy/15",
    ring: "group-hover:ring-brand-navy/20",
    link: "text-brand-navy",
  },
  warm: {
    icon: "bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-primary/25",
    glow: "from-primary/10 via-secondary/10",
    ring: "group-hover:ring-primary/20",
    link: "text-primary",
  },
} as const

export function LandingFeatureCard({
  icon: Icon,
  title,
  description,
  href,
  accent,
  className,
}: LandingFeatureCardProps) {
  const styles = ACCENT[accent]
  const content = (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-gradient-to-br to-transparent opacity-80 blur-2xl transition-opacity group-hover:opacity-100",
          styles.glow,
        )}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4">
        <span
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105",
            styles.icon,
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {href ? (
          <span
            className={cn(
              "mt-auto inline-flex items-center gap-1 text-sm font-semibold transition-colors",
              styles.link,
            )}
          >
            Khám phá
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        ) : null}
      </div>
    </>
  )

  const cardClass = cn(
    "group relative flex h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm ring-1 ring-transparent transition-all duration-300",
    "hover:-translate-y-1 hover:border-border hover:shadow-lg hover:shadow-black/5",
    styles.ring,
    className,
  )

  if (href) {
    return (
      <Link href={href} prefetch={false} className={cardClass}>
        {content}
      </Link>
    )
  }

  return <article className={cardClass}>{content}</article>
}
