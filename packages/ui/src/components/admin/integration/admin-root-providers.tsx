"use client"

import type { ReactNode } from "react"
import NextTopLoader from "nextjs-toploader"
import { Toaster } from "sonner"
import { ThemeProvider } from "../../theme-provider"
import { TextSizeProvider } from "../../text-size-provider"

export type AdminRootProvidersProps = {
  children: ReactNode
}

/** Providers gốc dùng chung mọi app admin (theme, cỡ chữ, toast, top loader). */
export function AdminRootProviders({ children }: AdminRootProvidersProps) {
  return (
    <>
      <NextTopLoader
        color="var(--primary)"
        showSpinner={false}
        shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
      />
      <ThemeProvider>
        <TextSizeProvider>
          {children}
          <Toaster position="top-right" richColors />
        </TextSizeProvider>
      </ThemeProvider>
    </>
  )
}
