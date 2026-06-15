"use client"

import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import {
  createHubQueryClient,
  hubAdminQueryClientDefaultOptions,
} from "@workspace/query-client"
import { createAdminMutationCache } from "@ui/lib/admin-operation-toast"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() =>
    createHubQueryClient({
      mutationCache: createAdminMutationCache(),
      defaultOptions: hubAdminQueryClientDefaultOptions,
    }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
