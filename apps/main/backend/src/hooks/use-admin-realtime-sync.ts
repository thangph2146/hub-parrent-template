"use client"

import { useEffect, useRef, useState } from "react"
import type { QueryClient } from "@tanstack/react-query"
import { toast } from "@ui/components/sonner"
import { io, type Socket } from "socket.io-client"
import {
  ADMIN_SOCKET_EVENTS,
  markRealtimeToastShown,
  resolveRealtimeNotificationToast,
  shouldShowRealtimeSyncToast,
  type AdminCacheInvalidatePayload,
  type AdminStatusChangePayload,
  type ParentStudentReviewSocketPayload,
  type SocketNotificationPayload,
} from "@workspace/api-client/realtime"
import {
  ADMIN_SOCKET_PATH,
  getAdminSocketOrigin,
  resolveAdminSocketAuth,
} from "@/lib/admin-socket"
import { queryPrefixesForAdminResource } from "@/lib/admin-realtime-query-map"
import { rbacQueryKeys } from "@/app/rbac/_component/_query/rbac-query-keys"
import { queryKeys } from "@/hooks/queries"

function invalidateAdminPayload(
  queryClient: QueryClient,
  payload: AdminCacheInvalidatePayload
) {
  for (const prefix of queryPrefixesForAdminResource(
    payload.resource,
    payload.id
  )) {
    void queryClient.invalidateQueries({ queryKey: [...prefix] })
  }
}

function invalidateStatusChange(
  queryClient: QueryClient,
  payload: AdminStatusChangePayload
) {
  invalidateAdminPayload(queryClient, {
    resource: payload.resource,
    action: "update",
    id: payload.id,
  })
  void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
}

function invalidateRoleUpsert(
  queryClient: QueryClient,
  payload: { role?: { id?: string } }
) {
  void queryClient.invalidateQueries({ queryKey: rbacQueryKeys.all })
  const id = payload.role?.id
  if (id) {
    void queryClient.invalidateQueries({ queryKey: rbacQueryKeys.detail(id) })
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.rbacCatalog() })
}

function showRealtimeToast(
  payload: SocketNotificationPayload,
  currentUserId: string | null
) {
  if (!shouldShowRealtimeSyncToast(payload, currentUserId)) return
  const { method, title, description } =
    resolveRealtimeNotificationToast(payload)
  const data = description ? { description } : undefined
  if (method === "success") toast.success(title, data)
  else if (method === "warning") toast.warning(title, data)
  else if (method === "error") toast.error(title, data)
  else toast.info(title, data)
  markRealtimeToastShown(payload)
}

function invalidateNotificationQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ["notifications"] })
  void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
}

/**
 * Socket admin — invalidate cache + toast khi có thay đổi từ tab/user khác.
 * Tab hiện tại: toast mutation qua useAdminMutation (sau API 2xx), không trùng socket.
 */
export function useAdminRealtimeSync(
  enabled: boolean,
  queryClient: QueryClient
): { connected: boolean; socketError: boolean } {
  const queryClientRef = useRef(queryClient)
  const [connected, setConnected] = useState(false)
  const [socketError, setSocketError] = useState(false)

  useEffect(() => {
    queryClientRef.current = queryClient
  }, [queryClient])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setConnected(false)
      setSocketError(false)
      return
    }

    const auth = resolveAdminSocketAuth()
    if (!auth) {
      setConnected(false)
      setSocketError(true)
      return
    }

    let disposed = false
    const currentUserId = auth.userId

    const socket: Socket = io(getAdminSocketOrigin(), {
      path: ADMIN_SOCKET_PATH,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 12,
      withCredentials: true,
      auth,
    })

    const onConnect = () => {
      if (disposed) return
      setConnected(true)
      setSocketError(false)
    }

    const onDisconnect = () => {
      if (disposed) return
      setConnected(false)
    }

    const onConnectError = () => {
      if (disposed) return
      setConnected(false)
      setSocketError(true)
    }

    const onAdminInvalidate = (payload: AdminCacheInvalidatePayload) => {
      if (disposed || !payload?.resource) return
      invalidateAdminPayload(queryClientRef.current, payload)
    }

    const onAdminStatusChanged = (payload: AdminStatusChangePayload) => {
      if (disposed || !payload?.resource || !payload?.id) return
      invalidateStatusChange(queryClientRef.current, payload)
    }

    const onRoleUpsert = (payload: { role?: { id?: string } }) => {
      if (disposed) return
      invalidateRoleUpsert(queryClientRef.current, payload)
    }

    const onUsersChanged = () => {
      if (disposed) return
      void queryClientRef.current.invalidateQueries({
        queryKey: queryKeys.staffUserList(),
      })
      void queryClientRef.current.invalidateQueries({
        queryKey: queryKeys.usersTrashed(),
      })
    }

    const onNotificationAdmin = (payload: SocketNotificationPayload) => {
      if (disposed) return
      showRealtimeToast(payload, currentUserId)
      invalidateNotificationQueries(queryClientRef.current)
    }

    const onNotificationNew = (payload: SocketNotificationPayload) => {
      if (disposed) return
      if (payload.toUserId && payload.toUserId !== currentUserId) return
      showRealtimeToast(payload, currentUserId)
      invalidateNotificationQueries(queryClientRef.current)
    }

    const onParentStudentReviewed = (
      payload: ParentStudentReviewSocketPayload
    ) => {
      if (disposed || !payload?.id) return
      invalidateAdminPayload(queryClientRef.current, {
        resource: "parent-students",
        action: "update",
        id: payload.id,
      })
      void queryClientRef.current.invalidateQueries({
        queryKey: queryKeys.myStudents(),
      })
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)
    socket.on(ADMIN_SOCKET_EVENTS.adminInvalidate, onAdminInvalidate)
    socket.on(ADMIN_SOCKET_EVENTS.adminStatusChanged, onAdminStatusChanged)
    socket.on(ADMIN_SOCKET_EVENTS.roleUpsert, onRoleUpsert)
    socket.on(ADMIN_SOCKET_EVENTS.sessionUpsert, onUsersChanged)
    socket.on(ADMIN_SOCKET_EVENTS.sessionRemove, onUsersChanged)
    socket.on(ADMIN_SOCKET_EVENTS.sessionRevoked, onUsersChanged)
    socket.on(ADMIN_SOCKET_EVENTS.notificationAdmin, onNotificationAdmin)
    socket.on(ADMIN_SOCKET_EVENTS.notificationNew, onNotificationNew)
    socket.on(
      ADMIN_SOCKET_EVENTS.parentStudentReviewed,
      onParentStudentReviewed
    )

    return () => {
      disposed = true
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
      socket.off(ADMIN_SOCKET_EVENTS.adminInvalidate, onAdminInvalidate)
      socket.off(ADMIN_SOCKET_EVENTS.adminStatusChanged, onAdminStatusChanged)
      socket.off(ADMIN_SOCKET_EVENTS.roleUpsert, onRoleUpsert)
      socket.off(ADMIN_SOCKET_EVENTS.sessionUpsert, onUsersChanged)
      socket.off(ADMIN_SOCKET_EVENTS.sessionRemove, onUsersChanged)
      socket.off(ADMIN_SOCKET_EVENTS.sessionRevoked, onUsersChanged)
      socket.off(ADMIN_SOCKET_EVENTS.notificationAdmin, onNotificationAdmin)
      socket.off(ADMIN_SOCKET_EVENTS.notificationNew, onNotificationNew)
      socket.off(
        ADMIN_SOCKET_EVENTS.parentStudentReviewed,
        onParentStudentReviewed
      )
      socket.close()
      setConnected(false)
      setSocketError(false)
    }
  }, [enabled])

  return { connected, socketError }
}
