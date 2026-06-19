import { ImageIcon } from "lucide-react"
import { cn } from "@ui/lib/utils"
import { getPosterUrl } from "@/lib/site/public-events"

type EventPosterProps = {
  poster?: unknown
  alt: string
  className?: string
  imageClassName?: string
  placeholderClassName?: string
  aspectClassName?: string
  priority?: boolean
  overlay?: React.ReactNode
  showBottomGradient?: boolean
}

/**
 * Poster sự kiện — dùng URL API trực tiếp (giống admin), không qua next/image optimizer.
 */
export function EventPoster({
  poster,
  alt,
  className,
  imageClassName,
  placeholderClassName = "size-10 text-muted-foreground/40",
  aspectClassName = "aspect-[16/10] w-full",
  priority = false,
  overlay,
  showBottomGradient = false,
}: EventPosterProps) {
  const posterUrl = getPosterUrl(poster)

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectClassName, className)}>
      {posterUrl ? (
        <>
          <img
            src={posterUrl}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              imageClassName,
            )}
          />
          {showBottomGradient ? (
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              aria-hidden
            />
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className={placeholderClassName} aria-hidden />
        </div>
      )}
      {overlay}
    </div>
  )
}
