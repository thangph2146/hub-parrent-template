"use client"

import type { ReactNode } from "react"
import { SiteRootProviders } from "../../site"

export type AdminRootProvidersProps = {
  children: ReactNode
}

/** Providers gốc dùng chung mọi app admin (theme, cỡ chữ, toast, top loader). */
export function AdminRootProviders({ children }: AdminRootProvidersProps) {
  return (
    <SiteRootProviders toaster={{ position: "top-right", richColors: true }}>
      {children}
    </SiteRootProviders>
  )
}
