"use client"
import { api } from "@workspace/admin-app/lib/api"
import { useQuery } from "@tanstack/react-query"
import { isAbortLikeError } from "@workspace/logger"
import type { DatabaseSchemaResponse } from "../types"

export function useDatabaseSchema(enabled = true) {
  const query = useQuery<DatabaseSchemaResponse, Error>({
    queryKey: ["system", "database-schema"],
    enabled,
    queryFn: ({ signal }) => api.system.getDatabaseSchema({ signal }),
    retry: false,
  })

  const error =
    query.error && !isAbortLikeError(query.error) ? query.error.message : null

  return {
    schema: query.data ?? null,
    loading: query.isLoading,
    error,
  }
}
