"use client"

import { useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"

export type AdminCrudNavigationOptions = {
  /** Prefetch React Query detail (gọi từ list / hover dòng). */
  prefetchDetail?: (id: string) => void | Promise<void>
}

/**
 * Điều hướng CRUD admin: prefetch route + `startTransition` để chuyển trang mượt.
 * Dùng trên list page thay cho `router.push` trực tiếp.
 */
export function useAdminCrudNavigation(
  basePath: `/${string}`,
  options?: AdminCrudNavigationOptions
) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const prefetchHref = useCallback(
    (href: string) => {
      try {
        router.prefetch(href)
      } catch {
        // prefetch best-effort
      }
    },
    [router]
  )

  const navigate = useCallback(
    (href: string, beforePush?: () => void | Promise<void>) => {
      prefetchHref(href)
      void Promise.resolve(beforePush?.()).finally(() => {
        startTransition(() => {
          router.push(href)
        })
      })
    },
    [prefetchHref, router]
  )

  const prefetchRecord = useCallback(
    (id: string) => {
      const normalizedId = String(id)
      prefetchHref(`${basePath}/${normalizedId}`)
      prefetchHref(`${basePath}/${normalizedId}/edit`)
      void options?.prefetchDetail?.(normalizedId)
    },
    [basePath, options, prefetchHref]
  )

  return {
    isPending,
    list: () => navigate(basePath),
    new: () => navigate(`${basePath}/new`),
    view: (id: string) =>
      navigate(`${basePath}/${id}`, () => options?.prefetchDetail?.(id)),
    edit: (id: string) =>
      navigate(`${basePath}/${id}/edit`, () => options?.prefetchDetail?.(id)),
    prefetch: prefetchRecord,
    push: navigate,
    prefetchHref,
  }
}
