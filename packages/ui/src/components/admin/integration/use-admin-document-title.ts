"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"

export type AdminDocumentHeadTarget = {
  title: string
  description: string
}

/** Preview `<title>` + meta description — cùng logic `useAdminDocumentTitle`. */
export function buildAdminDocumentHead(options: {
  siteName?: string
  siteDescription?: string
  /** Title từ tab seo-global — ưu tiên hơn `Quản trị {siteName}`. */
  metaTitle?: string
  /** Mô tả từ tab seo-global — ưu tiên hơn siteDescription (tab display). */
  metaDescription?: string
  titleFallback: string
  descriptionFallback: string
}): AdminDocumentHeadTarget {
  const siteName = options.siteName?.trim()
  const metaTitle = options.metaTitle?.trim()
  const title =
    metaTitle && metaTitle.length > 0
      ? metaTitle
      : siteName && siteName.length > 0
        ? `Quản trị ${siteName}`
        : options.titleFallback
  const description =
    options.metaDescription?.trim() ||
    options.siteDescription?.trim() ||
    options.descriptionFallback
  return { title, description }
}

function applyAdminDocumentHead(target: AdminDocumentHeadTarget) {
  if (typeof document === "undefined") return

  if (document.title !== target.title) {
    document.title = target.title
  }

  const metas = document.querySelectorAll('meta[name="description"]')
  if (metas.length === 0) {
    const el = document.createElement("meta")
    el.setAttribute("name", "description")
    el.setAttribute("content", target.description)
    document.head.appendChild(el)
    return
  }

  metas.forEach((el) => {
    if (el.getAttribute("content") !== target.description) {
      el.setAttribute("content", target.description)
    }
  })
}

/**
 * Cập nhật `<title>` và meta description từ settings branding.
 * Next.js App Router có thể inject lại metadata tĩnh sau hydrate — hook này
 * re-apply khi route đổi và theo dõi thay đổi trong `<head>`.
 */
export function useAdminDocumentTitle(options: {
  siteName?: string
  siteDescription?: string
  metaTitle?: string | null
  metaDescription?: string | null
  titleFallback?: string
  descriptionFallback?: string
  enabled?: boolean
}) {
  const pathname = usePathname()
  const enabled = options.enabled ?? true
  const titleFallback = options.titleFallback ?? "Quản trị HUB"
  const descriptionFallback =
    options.descriptionFallback ?? "Cổng quản trị nội bộ."

  useLayoutEffect(() => {
    if (!enabled) return

    const sync = () => {
      applyAdminDocumentHead(
        buildAdminDocumentHead({
          siteName: options.siteName,
          siteDescription: options.siteDescription,
          metaTitle: options.metaTitle ?? undefined,
          metaDescription: options.metaDescription ?? undefined,
          titleFallback,
          descriptionFallback,
        })
      )
    }

    sync()
    const raf = requestAnimationFrame(sync)
    const timer = window.setTimeout(sync, 0)

    const observer = new MutationObserver(() => {
      sync()
    })
    observer.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["content"],
      characterData: true,
    })

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [
    enabled,
    pathname,
    options.siteName,
    options.siteDescription,
    options.metaTitle,
    options.metaDescription,
    titleFallback,
    descriptionFallback,
  ])
}
