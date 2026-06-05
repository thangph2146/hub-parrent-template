"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { cn } from "../../lib/utils"

const TABLE_CONTAINER_SELECTOR = '[data-slot="table-container"]'
const SCROLL_EDGE_THRESHOLD_PX = 6

export type DataTableHorizontalScrollProps = {
  children: ReactNode
  /** Thanh cuộn ngang phía trên bảng (đồng bộ với table-container). @default true */
  enabled?: boolean
  className?: string
  /** Đổi khi bảng mount lại (loading, số dòng…) để gắn lại listener scroll. */
  watchKey?: string | number
}

export function DataTableHorizontalScroll({
  children,
  enabled = true,
  className,
  watchKey,
}: DataTableHorizontalScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const topScrollRef = useRef<HTMLDivElement>(null)
  const scrollElRef = useRef<HTMLElement | null>(null)
  const syncingRef = useRef(false)
  const [showTopBar, setShowTopBar] = useState(false)
  const [spacerWidth, setSpacerWidth] = useState(0)

  const updateMetrics = useCallback(() => {
    const el = scrollElRef.current
    if (!el) {
      setShowTopBar(false)
      setSpacerWidth(0)
      return
    }
    const needsHorizontalScroll =
      el.scrollWidth > el.clientWidth + SCROLL_EDGE_THRESHOLD_PX
    setShowTopBar(needsHorizontalScroll)
    setSpacerWidth(el.scrollWidth)
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = el.scrollLeft
    }
  }, [])

  const syncFromTable = useCallback(() => {
    const el = scrollElRef.current
    const top = topScrollRef.current
    if (!el || !top || syncingRef.current) return
    syncingRef.current = true
    top.scrollLeft = el.scrollLeft
    syncingRef.current = false
  }, [])

  const syncFromTop = useCallback(() => {
    const el = scrollElRef.current
    const top = topScrollRef.current
    if (!el || !top || syncingRef.current) return
    syncingRef.current = true
    el.scrollLeft = top.scrollLeft
    syncingRef.current = false
  }, [])

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current
    if (!root) return

    let resizeObserver: ResizeObserver | null = null
    let rafId = 0

    const detach = () => {
      cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
      resizeObserver = null
      scrollElRef.current?.removeEventListener("scroll", syncFromTable)
      topScrollRef.current?.removeEventListener("scroll", syncFromTop)
      scrollElRef.current = null
    }

    const attach = () => {
      detach()
      const el = root.querySelector(
        TABLE_CONTAINER_SELECTOR
      ) as HTMLElement | null
      if (!el) return false
      scrollElRef.current = el
      updateMetrics()
      el.addEventListener("scroll", syncFromTable, { passive: true })
      topScrollRef.current?.addEventListener("scroll", syncFromTop, {
        passive: true,
      })
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(updateMetrics)
      })
      resizeObserver.observe(el)
      const table = el.querySelector("table")
      if (table) resizeObserver.observe(table)
      return true
    }

    if (!attach()) {
      rafId = requestAnimationFrame(() => attach())
    }

    return detach
  }, [enabled, syncFromTable, syncFromTop, updateMetrics, watchKey])

  if (!enabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={rootRef} className={cn("flex flex-col", className)}>
      <div
        ref={topScrollRef}
        className={cn(
          "shrink-0 overflow-x-auto overflow-y-hidden border-b border-border/60 bg-muted/15",
          !showTopBar && "pointer-events-none h-0 overflow-hidden border-b-0 opacity-0"
        )}
        style={showTopBar ? { height: "0.75rem" } : undefined}
        onScroll={syncFromTop}
        aria-hidden={!showTopBar}
        tabIndex={showTopBar ? 0 : -1}
        aria-label="Cuộn ngang bảng"
      >
        <div aria-hidden style={{ width: spacerWidth, height: 1 }} />
      </div>
      {children}
    </div>
  )
}
