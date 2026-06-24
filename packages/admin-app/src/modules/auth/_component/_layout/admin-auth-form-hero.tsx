import { Skeleton } from "@ui/components/skeleton"

const DEFAULT_AUTH_HERO_IMAGE =
  "https://hub.edu.vn/DATA/IMAGES/2024/12/31/20241231235033-1vehub.jpg"

export function resolveAdminAuthHeroImage(
  imageUrl?: string | null,
  fallback = DEFAULT_AUTH_HERO_IMAGE,
): string {
  const trimmed = imageUrl?.trim()
  return trimmed || fallback
}

export function AdminAuthFormHeroSkeleton() {
  return (
    <div
      className="relative hidden h-full min-h-[min(100svh-2rem,52rem)] lg:flex"
      aria-busy="true"
      aria-label="Đang tải hình ảnh hệ thống"
    >
      <Skeleton shimmer className="absolute inset-0 h-full w-full rounded-none" />
      <div className="relative z-10 flex h-full flex-col justify-end p-8 xl:p-12">
        <div className="max-w-sm space-y-2">
          <Skeleton shimmer className="h-3 w-28 bg-background/30" />
          <Skeleton shimmer className="h-7 w-full max-w-xs bg-background/30" />
        </div>
      </div>
    </div>
  )
}

export type AdminAuthFormHeroProps = {
  siteName: string
  siteDescription?: string | null
  imageSrc?: string | null
  imageAlt?: string
  isReady?: boolean
}

export function AdminAuthFormHero({
  siteName,
  siteDescription,
  imageSrc,
  imageAlt = "Hình ảnh HUB",
  isReady = true,
}: AdminAuthFormHeroProps) {
  if (!isReady) {
    return <AdminAuthFormHeroSkeleton />
  }

  const resolvedSrc = resolveAdminAuthHeroImage(imageSrc)
  return (
    <div className="relative hidden h-full min-h-[min(100svh-2rem,52rem)] lg:flex">
      <img
        src={resolvedSrc}
        alt={imageAlt}
        title={imageAlt}
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
      />
      <div className="relative z-10 flex h-full flex-col justify-end p-8 xl:p-12">
        <div className="max-w-sm space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
            {siteName}
          </p>
          {siteDescription ? (
            <p className="text-xl font-medium leading-snug text-white">
              {siteDescription}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
