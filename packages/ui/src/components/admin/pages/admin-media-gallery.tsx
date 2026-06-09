"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "../../../lib/utils"
import { resolveMediaUrl } from "../../../lib/resolve-media-url"
import { Badge } from "../../badge"

export type AdminMediaGalleryProps = {
  images: readonly string[]
  alt: string
  /** `gallery`: ảnh lớn + hàng thumbnail; `grid`: lưới hiển thị hết ảnh */
  layout?: "gallery" | "grid"
  className?: string
  emptyLabel?: string
  priority?: boolean
}

function GalleryImage({
  src,
  alt,
  active,
  onClick,
  sizes,
  className,
  priority,
}: {
  src: string
  alt: string
  active?: boolean
  onClick?: () => void
  sizes: number
  className?: string
  priority?: boolean
}) {
  const resolved = resolveMediaUrl(src, sizes)
  const frameClass = cn(
    "relative block overflow-hidden rounded-lg border bg-muted transition-all",
    onClick && "cursor-pointer hover:border-primary/50",
    active && "ring-2 ring-primary ring-offset-2 ring-offset-background",
    className
  )
  const image = (
    <img
      src={resolved}
      alt={alt}
      className="size-full object-cover"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={frameClass}>
        {image}
      </button>
    )
  }

  return <div className={frameClass}>{image}</div>
}

export function AdminMediaGallery({
  images,
  alt,
  layout = "gallery",
  className,
  emptyLabel = "Chưa có ảnh",
  priority = false,
}: AdminMediaGalleryProps) {
  const urls = images.filter((url) => url.trim().length > 0)
  const [activeIndex, setActiveIndex] = useState(0)
  const safeIndex = urls.length > 0 ? Math.min(activeIndex, urls.length - 1) : 0

  if (urls.length === 0) {
    return (
      <div
        className={cn(
          "flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 text-muted-foreground",
          className
        )}
      >
        <ImageIcon className="size-10 opacity-40" aria-hidden />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    )
  }

  if (layout === "grid") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Hình ảnh
          </p>
          <Badge variant="outline" className="text-[10px]">
            {urls.length} ảnh
          </Badge>
        </div>
        <div
          className={cn(
            "grid gap-2",
            urls.length === 1
              ? "grid-cols-1"
              : urls.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
          )}
        >
          {urls.map((url, index) => (
            <GalleryImage
              key={`${url}-${index}`}
              src={url}
              alt={`${alt} ${index + 1}`}
              sizes={480}
              priority={priority && index === 0}
              className="aspect-square w-full"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
        <img
          src={resolveMediaUrl(urls[safeIndex]!, 960)}
          alt={`${alt} ${safeIndex + 1}`}
          className="size-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
        {urls.length > 1 ? (
          <Badge className="absolute top-2 right-2 text-[10px]">
            {safeIndex + 1}/{urls.length}
          </Badge>
        ) : null}
      </div>
      {urls.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {urls.map((url, index) => (
            <GalleryImage
              key={`${url}-${index}`}
              src={url}
              alt={`${alt} ${index + 1}`}
              active={index === safeIndex}
              onClick={() => setActiveIndex(index)}
              sizes={160}
              className="aspect-square w-full"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
