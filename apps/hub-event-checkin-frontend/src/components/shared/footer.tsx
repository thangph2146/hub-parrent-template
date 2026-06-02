import Link from "next/link"
import { ArrowRight, CalendarDays, ExternalLink, Mail, MapPin } from "lucide-react"
import { Separator } from "@ui/components/separator"
import { Logo } from "@/components/icons/logo"
import {
  FOOTER_EVENT_LINKS,
  FOOTER_RESOURCE_LINKS,
  SITE_BRAND,
} from "@/lib/site-nav"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-primary/15 bg-secondary text-secondary-foreground">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-12 md:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="rounded-lg border border-white/15 bg-white p-2">
                <Logo className="h-10 w-10" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">{SITE_BRAND.name}</p>
                <p className="text-xs text-white/70">{SITE_BRAND.tagline}</p>
              </div>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/75">{SITE_BRAND.description}</p>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white">
              <CalendarDays className="size-4" />
              Sự kiện
            </h3>
            <nav className="space-y-2.5">
              {FOOTER_EVENT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
                >
                  <ArrowRight className="size-3.5 shrink-0 opacity-70" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{SITE_BRAND.school}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                <a href="https://hub.edu.vn" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                  hub.edu.vn
                </a>
              </li>
            </ul>
            <nav className="space-y-2 border-t border-white/10 pt-3">
              {FOOTER_RESOURCE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  {...("external" in link && link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
                >
                  {link.label}
                  {"external" in link && link.external ? <ExternalLink className="size-3.5" /> : null}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <Separator className="my-8 bg-white/15" />

        <p className="text-center text-xs text-white/70 sm:text-sm">
          &copy; {currentYear} {SITE_BRAND.name} · {SITE_BRAND.school}. Phát triển cho cộng đồng sinh viên
          HUB.
        </p>
      </div>
    </footer>
  )
}
