"use client"

import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { createHubQueryClient } from "@workspace/query-client"

export function EventsQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() =>
    createHubQueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
