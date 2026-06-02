"use client"

import type { ReactNode } from "react"
import NextTopLoader from "nextjs-toploader"
import { Toaster, type ToasterProps } from "sonner"
import { ThemeProvider } from "../theme-provider"
import { TextSizeProvider } from "../text-size-provider"

export type SiteRootProvidersProps = {
  children: ReactNode
  /** Bật thanh tiến trình chuyển trang Next (mặc định true). */
  showTopLoader?: boolean
  toaster?: Pick<ToasterProps, "position" | "richColors">
}

/** Providers gốc storefront / cổng sự kiện (theme, cỡ chữ, toast). */
export function SiteRootProviders({
  children,
  showTopLoader = true,
  toaster = { position: "top-center", richColors: true },
}: SiteRootProvidersProps) {
  return (
    <>
      {showTopLoader ? (
        <NextTopLoader
          color="var(--primary)"
          showSpinner={false}
          shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
        />
      ) : null}
      <ThemeProvider>
        <TextSizeProvider>
          {children}
          <Toaster position={toaster.position} richColors={toaster.richColors} />
        </TextSizeProvider>
      </ThemeProvider>
    </>
  )
}
