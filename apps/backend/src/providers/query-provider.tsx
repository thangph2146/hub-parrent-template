"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createHubQueryClient } from "@workspace/query-client";
import { createAdminMutationCache } from "@/hooks/use-admin-mutation";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() =>
    createHubQueryClient({ mutationCache: createAdminMutationCache() }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
