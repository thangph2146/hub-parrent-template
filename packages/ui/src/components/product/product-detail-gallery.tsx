"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react"
import { ChevronLeft, ChevronRight, Images, Package } from "lucide-react"
import { Button } from "../button"
import { Badge } from "../badge"
import { resolveMediaUrl } from "../../lib/resolve-media-url"
import { cn } from "../../lib/utils"

export type ProductDetailGalleryProps = {
  images: readonly string[]
  alt: string
  className?: string
}

const HERO_WIDTH = 1280
const THUMB_WIDTH = 280

/** Nút điều hướng gallery — cố định kích thước, không nhảy khi active. */
const GALLERY_NAV_BTN_CLASS =
  "size-8 shrink-0 rounded-full bg-background/95 shadow-sm backdrop-blur-sm active:transform-none"

function uniqueImages(images: readonly string[]) {
  const seen = new Set<string>()
  return images.filter((url) => {
    const trimmed = url.trim()
    if (!trimmed || seen.has(trimmed)) return false
    seen.add(trimmed)
    return true
  })
}

function isThumbInStripView(
  strip: HTMLDivElement,
  thumb: HTMLButtonElement
): boolean {
  const padding = 4
  const left = thumb.offsetLeft
  const right = left + thumb.offsetWidth
  const viewLeft = strip.scrollLeft
  const viewRight = viewLeft + strip.clientWidth
  return left >= viewLeft - padding && right <= viewRight + padding
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
  const thumbStripRef = useRef<HTMLDivElement>(null)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    setActiveIndex(0)
  }, [images])

  const scrollThumbStripToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const strip = thumbStripRef.current
      const thumb = thumbRefs.current[index]
      if (!strip || !thumb) return

      if (isThumbInStripView(strip, thumb)) return

      const target =
        thumb.offsetLeft - strip.clientWidth / 2 + thumb.offsetWidth / 2
      const maxScroll = Math.max(0, strip.scrollWidth - strip.clientWidth)

      strip.scrollTo({
        left: Math.max(0, Math.min(target, maxScroll)),
        behavior,
      })
    },
    []
  )

  const goTo = useCallback(
    (index: number) => {
      if (urls.length === 0) return
      const next = ((index % urls.length) + urls.length) % urls.length
      setActiveIndex(next)
    },
    [urls.length]
  )

  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex])
  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex])

  useEffect(() => {
    scrollThumbStripToIndex(safeIndex)
  }, [safeIndex, scrollThumbStripToIndex])

  const preventFocusScroll = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-outline-variant/30 bg-muted/15 shadow-sm">
        {activeImage ? (
          <img
            src={resolveMediaUrl(activeImage, HERO_WIDTH)}
            alt={alt}
            className="absolute inset-0 size-full object-contain p-3 sm:p-5"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Package className="size-16 opacity-35" aria-hidden />
            <p className="text-sm">Chưa có ảnh</p>
          </div>
        )}

        {urls.length > 1 ? (
          <>
            <Badge
              variant="overlay"
              size="xs"
              className="absolute top-3 right-3 z-10"
            >
              <Images className="size-3" aria-hidden />
              {safeIndex + 1}/{urls.length}
            </Badge>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className={cn(GALLERY_NAV_BTN_CLASS, "pointer-events-auto")}
                onMouseDown={preventFocusScroll}
                onClick={goPrev}
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className={cn(GALLERY_NAV_BTN_CLASS, "pointer-events-auto")}
                onMouseDown={preventFocusScroll}
                onClick={goNext}
                aria-label="Ảnh sau"
              >
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </>
        ) : null}
      </div>

      {urls.length > 1 ? (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className={GALLERY_NAV_BTN_CLASS}
            onMouseDown={preventFocusScroll}
            onClick={goPrev}
            aria-label="Ảnh thumbnail trước"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>

          <div
            ref={thumbStripRef}
            className="flex min-w-0 flex-1 gap-2 overflow-x-auto scroll-smooth py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Ảnh sản phẩm"
          >
            {urls.map((img, index) => {
              const active = index === safeIndex
              return (
                <button
                  key={`${img}-${index}`}
                  ref={(node) => {
                    thumbRefs.current[index] = node
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Ảnh ${index + 1}`}
                  onMouseDown={preventFocusScroll}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "box-border shrink-0 overflow-hidden rounded-xl border-2 bg-background p-1",
                    "h-[4.25rem] w-[4.25rem] sm:h-[4.75rem] sm:w-[4.75rem]",
                    active
                      ? "border-primary"
                      : "border-outline-variant/35 opacity-80 hover:border-primary/40 hover:opacity-100"
                  )}
                >
                  <img
                    src={resolveMediaUrl(img, THUMB_WIDTH)}
                    alt={`${alt} ${index + 1}`}
                    className="size-full rounded-lg object-cover"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className={GALLERY_NAV_BTN_CLASS}
            onMouseDown={preventFocusScroll}
            onClick={goNext}
            aria-label="Ảnh thumbnail sau"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
