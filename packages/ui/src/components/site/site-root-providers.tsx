"use client"

import type { ReactNode } from "react"
import NextTopLoader, { type NextTopLoaderProps } from "nextjs-toploader"
import { Toaster, type ToasterProps } from "../sonner"
import { ThemeProvider } from "../theme-provider"
import { TextSizeProvider } from "../text-size-provider"

export type SiteRootProvidersProps = {
  children: ReactNode
  /** Bật thanh tiến trình chuyển trang Next (mặc định true). */
  showTopLoader?: boolean
  /** Tuỳ chỉnh nextjs-toploader (admin thường crawl nhanh hơn). */
  topLoaderProps?: Partial<NextTopLoaderProps>
  toaster?: Pick<ToasterProps, "position" | "richColors">
}

const DEFAULT_TOP_LOADER: Partial<NextTopLoaderProps> = {
  color: "var(--primary)",
  showSpinner: false,
  height: 2,
  crawlSpeed: 380,
  speed: 280,
  easing: "ease",
  shadow: "0 0 8px var(--primary),0 0 4px var(--primary)",
  zIndex: 1600,
}

/** Providers gốc storefront / cổng sự kiện (theme, cỡ chữ, toast). */
export function SiteRootProviders({
  children,
  showTopLoader = true,
  topLoaderProps,
  toaster = { position: "top-right", richColors: true },
}: SiteRootProvidersProps) {
  return (
    <>
      {showTopLoader ? (
        <NextTopLoader {...DEFAULT_TOP_LOADER} {...topLoaderProps} />
      ) : null}
      <ThemeProvider>
        <TextSizeProvider>
          {children}
          <Toaster
            position={toaster.position}
            richColors={toaster.richColors}
          />
        </TextSizeProvider>
      </ThemeProvider>
    </>
  )
}
