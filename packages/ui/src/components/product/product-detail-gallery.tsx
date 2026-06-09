"use client"

import { useEffect, useMemo, useState } from "react"
import { Images, Package } from "lucide-react"
import { Button } from "../button"
import { Card, CardContent } from "../card"
import { Badge } from "../badge"
import { resolveMediaUrl } from "../../lib/resolve-media-url"
import { cn } from "../../lib/utils"

export type ProductDetailGalleryProps = {
  images: readonly string[]
  alt: string
  className?: string
}

function uniqueImages(images: readonly string[]) {
  const seen = new Set<string>()
  return images.filter((url) => {
    const trimmed = url.trim()
    if (!trimmed || seen.has(trimmed)) return false
    seen.add(trimmed)
    return true
  })
}

export function ProductDetailGallery({
  images,
  alt,
  className,
}: ProductDetailGalleryProps) {
  const urls = useMemo(() => uniqueImages(images), [images])
  const [activeIndex, setActiveIndex] = useState(0)
  const safeIndex = urls.length > 0 ? Math.min(activeIndex, urls.length - 1) : 0
  const activeImage = urls[safeIndex]

  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  return (
    <>
      <CardContent className="space-y-4 px-0 group-data-[size=sm]/card:px-0">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/30 bg-gradient-to-br from-white via-white to-muted/30 p-6 shadow-inner">
          {activeImage ? (
            <img
              key={activeImage}
              src={resolveMediaUrl(activeImage, 960)}
              alt={alt}
              className="max-h-[88%] max-w-[88%] rounded-xl object-cover drop-shadow-[0_18px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out"
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Package className="size-16 opacity-35" aria-hidden />
              <p className="text-sm">Chưa có ảnh</p>
            </div>
          )}
          {urls.length > 1 ? (
            <Badge className="absolute top-3 right-3 gap-1 text-[10px] shadow-sm">
              <Images className="size-3" aria-hidden />
              {safeIndex + 1}/{urls.length}
            </Badge>
          ) : null}
        </div>
        {urls.length > 1 ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {urls.map((img, index) => {
              const active = index === safeIndex
              return (
                <Button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "aspect-square h-auto overflow-hidden rounded-xl border-2 bg-white p-1.5 transition-all",
                    active
                      ? "scale-[1.02] border-primary shadow-md ring-2 ring-primary/20"
                      : "border-outline-variant/30 hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <img
                    src={resolveMediaUrl(img, 160)}
                    alt={`${alt} ${index + 1}`}
                    className="size-full rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </Button>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </>
  )
}
