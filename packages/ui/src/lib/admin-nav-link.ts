"use client"

import { useCallback, useTransition, type MouseEvent } from "react"
import { useRouter } from "next/navigation"
import { useAdminRouteProgress } from "./admin-route-progress"

/** Prefetch route + điều hướng trong `startTransition` (chuyển trang mượt, ưu tiên tương tác). */
export function useAdminNavLink(href: string) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { startIfNavigating } = useAdminRouteProgress()

  const prefetch = useCallback(() => {
    try {
      router.prefetch(href)
    } catch {
      // best-effort
    }
  }, [href, router])

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, afterClick?: () => void) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0 ||
        event.defaultPrevented
      ) {
        return
      }

      afterClick?.()
      event.preventDefault()
      prefetch()
      startIfNavigating(href)
      startTransition(() => {
        router.push(href)
      })
    },
    [href, prefetch, router, startIfNavigating]
  )

  return { isPending, prefetch, onClick }
}
