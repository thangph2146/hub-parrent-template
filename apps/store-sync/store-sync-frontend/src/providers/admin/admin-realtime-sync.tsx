"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/providers/admin/auth-provider"
import { useAdminRealtimeSync } from "@/hooks/admin/use-admin-realtime-sync"

export function AdminRealtimeSync() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  useAdminRealtimeSync(!!user, queryClient)
  return null
}
