"use client"

import { useCallback } from "react"
import { useTopLoader } from "nextjs-toploader"

function normalizeRoutePath(href: string): string {
  if (typeof window === "undefined") return href
  try {
    const url = new URL(href, window.location.origin)
    return url.pathname + url.search
  } catch {
    return href.split("#")[0] ?? href
  }
}

/**
 * Bật thanh tiến trình (nextjs-toploader) khi điều hướng bằng `router.push`
 * — NextTopLoader mặc định chỉ bắt click `<a>`, không bắt nút bảng / CRUD.
 */
export function useAdminRouteProgress() {
  const loader = useTopLoader()

  const startIfNavigating = useCallback(
    (href: string) => {
      if (typeof window === "undefined") return
      const target = normalizeRoutePath(href)
      const current = window.location.pathname + window.location.search
      if (target === current) return
      loader.start()
    },
    [loader],
  )

  return { startIfNavigating }
}
